#!/usr/bin/env python3
"""
Простой турнирный сервер для Cashflow
Использует только HTTP для простоты
"""

import json
import time
import logging
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
from urllib.parse import parse_qs, urlparse

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TournamentServer:
    def __init__(self):
        self.players = {}  # ID участника -> данные
        self.spectators = {}  # IP зрителя -> время последнего просмотра
        self.tournament_start_time = None
        self.is_active = False
        self.is_paused = False
        self.pause_start_time = None
        
    def add_player(self, player_id, player_data):
        """Добавить участника"""
        self.players[player_id] = {
            **player_data,
            'id': player_id,
            'last_update': time.time(),
            'is_online': True
        }
        logger.info(f"🎮 Участник присоединился: {player_data.get('name', 'Unknown')}")
        
    def update_player(self, player_id, data):
        """Обновить данные участника"""
        if player_id in self.players:
            old_data = self.players[player_id].copy()
            self.players[player_id].update(data)
            self.players[player_id]['last_update'] = time.time()
            self.players[player_id]['is_online'] = True
            
            logger.info(f"📊 Обновление участника {self.players[player_id].get('name', 'Unknown')}: ${data.get('cash', 0)}")
            return old_data
        return None
        
    def remove_player(self, player_id):
        """Удалить участника"""
        if player_id in self.players:
            player_name = self.players[player_id].get('name', 'Unknown')
            del self.players[player_id]
            logger.info(f"👋 Участник отключился: {player_name}")
            
    def add_spectator(self, ip_address):
        """Добавить зрителя"""
        self.spectators[ip_address] = time.time()
        logger.info(f"👀 Добавлен зритель: {ip_address} (всего: {len(self.spectators)})")
        
    def remove_spectator(self, ip_address):
        """Удалить зрителя"""
        if ip_address in self.spectators:
            del self.spectators[ip_address]
            
    def cleanup_inactive_spectators(self):
        """Очистить неактивных зрителей (не просматривали более 2 минут)"""
        current_time = time.time()
        inactive_spectators = []
        
        for ip_address, last_view in list(self.spectators.items()):
            if current_time - last_view > 120:  # 2 минуты
                inactive_spectators.append(ip_address)
                
        for ip_address in inactive_spectators:
            self.remove_spectator(ip_address)
            
        if inactive_spectators:
            logger.info(f"👀 Удалено {len(inactive_spectators)} неактивных зрителей")
            
    def cleanup_inactive_players(self):
        """Очистить неактивных участников (не обновлялись более 5 минут)"""
        current_time = time.time()
        inactive_players = []
        
        for player_id, player in list(self.players.items()):
            if current_time - player.get('last_update', 0) > 300:  # 5 минут
                inactive_players.append(player_id)
                
        for player_id in inactive_players:
            self.remove_player(player_id)
            
        if inactive_players:
            logger.info(f"🧹 Удалено {len(inactive_players)} неактивных участников")
            
    def get_tournament_state(self):
        """Получить состояние турнира"""
        # Проверяем, кто онлайн (обновлялся за последние 30 секунд)
        current_time = time.time()
        online_count = 0
        
        for player in self.players.values():
            time_since_update = current_time - player.get('last_update', 0)
            if time_since_update <= 30:  # 30 секунд
                player['is_online'] = True
                online_count += 1
            else:
                player['is_online'] = False
        
        # Подсчитываем активных зрителей (просматривали за последние 2 минуты)
        active_spectators = 0
        for last_view in self.spectators.values():
            if current_time - last_view <= 120:  # 2 минуты
                active_spectators += 1
        
        return {
            'players': list(self.players.values()),
            'is_active': self.is_active,
            'is_paused': self.is_paused,
            'start_time': self.tournament_start_time,
            'total_players': len(self.players),
            'online_players': online_count,
            'online_spectators': active_spectators
        }
        
    def start_tournament(self):
        """Начать турнир"""
        self.is_active = True
        self.is_paused = False
        self.tournament_start_time = time.time()
        self.pause_start_time = None
        logger.info("🏁 Турнир начался!")
        
    def pause_tournament(self):
        """Поставить турнир на паузу"""
        if self.is_active and not self.is_paused:
            self.is_paused = True
            self.pause_start_time = time.time()
            logger.info("⏸️ Турнир поставлен на паузу!")
            
    def resume_tournament(self):
        """Возобновить турнир"""
        if self.is_active and self.is_paused:
            self.is_paused = False
            # Корректируем время начала турнира на время паузы
            if self.pause_start_time:
                pause_duration = time.time() - self.pause_start_time
                self.tournament_start_time += pause_duration
            self.pause_start_time = None
            logger.info("▶️ Турнир возобновлен!")
        
    def stop_tournament(self):
        """Остановить турнир"""
        duration = 0
        if self.tournament_start_time:
            duration = time.time() - self.tournament_start_time
        self.is_active = False
        self.is_paused = False
        self.tournament_start_time = None
        self.pause_start_time = None
        logger.info(f"🏁 Турнир завершен! Длительность: {duration:.1f} сек")

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, tournament=None, **kwargs):
        self.tournament = tournament
        super().__init__(*args, **kwargs)
    
    def end_headers(self):
        # Добавляем CORS заголовки
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
        
    def do_OPTIONS(self):
        # Обработка preflight запросов
        self.send_response(200)
        self.end_headers()
        
    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query_params = parse_qs(parsed_url.query)
        
        if path == '/spectator':
            # Зрительская страница
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            with open('spectator/index.html', 'rb') as f:
                self.wfile.write(f.read())
                
        elif path == '/admin':
            # Админ-панель
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            with open('admin/index.html', 'rb') as f:
                self.wfile.write(f.read())
                
        elif path == '/api/tournament/state':
            # API для получения состояния турнира
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            # Отслеживаем зрителя
            client_ip = self.client_address[0]
            self.tournament.add_spectator(client_ip)
            logger.info(f"👀 Зритель подключился: {client_ip}")
            
            state = self.tournament.get_tournament_state()
            self.wfile.write(json.dumps(state, ensure_ascii=False).encode('utf-8'))
            
        elif path == '/api/tournament/start':
            # API для запуска турнира
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            self.tournament.start_tournament()
            response = {'status': 'success', 'message': 'Турнир начался!'}
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        elif path == '/api/tournament/stop':
            # API для остановки турнира
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            self.tournament.stop_tournament()
            response = {'status': 'success', 'message': 'Турнир завершен!'}
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

        elif path == '/api/tournament/pause':
            # API для паузы турнира
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            self.tournament.pause_tournament()
            response = {'status': 'success', 'message': 'Турнир поставлен на паузу!'}
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

        elif path == '/api/tournament/resume':
            # API для возобновления турнира
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            self.tournament.resume_tournament()
            response = {'status': 'success', 'message': 'Турнир возобновлен!'}
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        elif path == '/api/player/join':
            # API для подключения участника
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            # Получаем данные участника из query параметров
            player_name = query_params.get('name', ['Участник'])[0]
            player_id = f"player_{int(time.time() * 1000)}"
            
            player_data = {
                'name': player_name,
                'cash': 0,
                'assets': [],
                'income': [],
                'expenses': [],
                'monthsCount': 0
            }
            
            self.tournament.add_player(player_id, player_data)
            
            response = {
                'status': 'success',
                'player_id': player_id,
                'message': f'Участник {player_name} присоединился к турниру'
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))

        elif path == '/api/test/add-players':
            # API для добавления тестовых участников
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            count = int(query_params.get('count', ['3'])[0])
            added_count = 0
            
            for i in range(count):
                if len(self.tournament.players) >= 20:  # Максимум 20 участников
                    break
                    
                player_id = f"test_player_{int(time.time() * 1000) + i}"
                player_name = f"Тест {i + 1}"
                
                player_data = {
                    'name': player_name,
                    'cash': 100000 + (i * 10000),
                    'assets': [],
                    'income': [],
                    'expenses': [],
                    'monthsCount': i,
                    'salary': 5000 + (i * 1000),
                    'passive_income': 1000 + (i * 500),
                    'total_income': 6000 + (i * 1500),
                    'total_expenses': 2000 + (i * 300),
                    'flow': 4000 + (i * 1200)
                }
                
                self.tournament.add_player(player_id, player_data)
                added_count += 1
            
            response = {
                'status': 'success',
                'added_count': added_count,
                'total_players': len(self.tournament.players),
                'message': f'Добавлено {added_count} тестовых участников'
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        elif path == '/api/player/update':
            # API для обновления данных участника
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            player_id = query_params.get('player_id', [''])[0]
            if player_id and player_id in self.tournament.players:
                # Получаем данные из query параметров
                cash = int(query_params.get('cash', [0])[0])
                assets_count = int(query_params.get('assets_count', [0])[0])
                months_count = int(query_params.get('months_count', [0])[0])
                
                # Новые финансовые показатели
                salary = int(query_params.get('salary', [0])[0])
                passive_income = int(query_params.get('passive_income', [0])[0])
                total_income = int(query_params.get('total_income', [0])[0])
                total_expenses = int(query_params.get('total_expenses', [0])[0])
                flow = int(query_params.get('flow', [0])[0])
                
                update_data = {
                    'cash': cash,
                    'assets': [{'name': f'Актив {i+1}'} for i in range(assets_count)],
                    'monthsCount': months_count,
                    'salary': salary,
                    'passive_income': passive_income,
                    'total_income': total_income,
                    'total_expenses': total_expenses,
                    'flow': flow
                }
                
                self.tournament.update_player(player_id, update_data)
                response = {'status': 'success', 'message': 'Данные обновлены'}
            else:
                response = {'status': 'error', 'message': 'Участник не найден'}
                
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            
        else:
            # Обычные файлы
            super().do_GET()
            
    def translate_path(self, path):
        # Маршрутизация для зрительской страницы и админ-панели
        if path == '/spectator':
            return 'spectator/index.html'
        elif path == '/spectator/':
            return 'spectator/index.html'
        elif path == '/admin':
            return 'admin/index.html'
        elif path == '/admin/':
            return 'admin/index.html'
        return super().translate_path(path)

def run_http_server(tournament):
    """Запуск HTTP сервера"""
    class Handler(CustomHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, tournament=tournament, **kwargs)
    
    httpd = HTTPServer(('0.0.0.0', 3000), Handler)
    logger.info("🌐 HTTP сервер запущен на http://0.0.0.0:3000")
    logger.info("📱 Участники: http://0.0.0.0:3000?tournament=true")
    logger.info("👁️ Зрители: http://0.0.0.0:3000/spectator")
    logger.info("👑 Админ-панель: http://0.0.0.0:3000/admin")
    logger.info("🚀 API: http://0.0.0.0:3000/api/tournament/state")
    
    # Запускаем фоновую задачу очистки неактивных участников и зрителей
    def cleanup_task():
        while True:
            time.sleep(60)  # Каждую минуту
            tournament.cleanup_inactive_players()
            tournament.cleanup_inactive_spectators()
    
    cleanup_thread = threading.Thread(target=cleanup_task, daemon=True)
    cleanup_thread.start()
    
    httpd.serve_forever()

def main():
    """Основная функция сервера"""
    tournament = TournamentServer()
    
    # Запускаем HTTP сервер
    run_http_server(tournament)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("🛑 Сервер остановлен пользователем")
    except Exception as e:
        logger.error(f"❌ Ошибка сервера: {e}")
