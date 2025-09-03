#!/usr/bin/env python3
"""
Турнирный сервер для Cashflow
Использует Python встроенные библиотеки для WebSocket
"""

import asyncio
import websockets
import json
import time
import logging
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import os

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TournamentServer:
    def __init__(self):
        self.players = {}  # ID участника -> данные
        self.spectators = set()  # ID зрителей
        self.tournament_start_time = None
        self.is_active = False
        
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
            
    def get_tournament_state(self):
        """Получить состояние турнира"""
        return {
            'players': list(self.players.values()),
            'is_active': self.is_active,
            'start_time': self.tournament_start_time,
            'total_players': len(self.players),
            'online_players': len([p for p in self.players.values() if p.get('is_online', False)]),
            'online_spectators': len(self.spectators)
        }
        
    def start_tournament(self):
        """Начать турнир"""
        self.is_active = True
        self.tournament_start_time = time.time()
        logger.info("🏁 Турнир начался!")
        
    def stop_tournament(self):
        """Остановить турнир"""
        self.is_active = False
        duration = time.time() - self.tournament_start_time if self.tournament_start_time else 0
        logger.info(f"🏁 Турнир завершен! Длительность: {duration:.1f} сек")
        

        
    def reset_tournament(self):
        """Сбросить время турнира"""
        self.tournament_start_time = time.time()
        logger.info("🔄 Время турнира сброшено")

class TournamentWebSocketHandler:
    def __init__(self, tournament):
        self.tournament = tournament
        self.clients = {}  # websocket -> client_info
        
    async def handle_client(self, websocket):
        """Обработка подключения клиента"""
        client_id = id(websocket)
        client_type = None
        
        logger.info(f"🔌 Новое WebSocket подключение: {client_id}")
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    logger.info(f"📨 Получено сообщение от {client_id}: {data.get('type', 'unknown')}")
                    await self.process_message(websocket, client_id, data)
                except json.JSONDecodeError:
                    logger.error(f"Ошибка JSON: {message}")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"🔌 WebSocket отключен: {client_id}")
        finally:
            await self.handle_disconnect(websocket, client_id)
            
    async def process_message(self, websocket, client_id, data):
        """Обработка сообщения от клиента"""
        message_type = data.get('type')
        
        if message_type == 'join_tournament':
            # Участник присоединяется к турниру
            client_type = 'player'
            player_data = data.get('data', {})
            self.tournament.add_player(client_id, player_data)
            self.clients[websocket] = {'type': 'player', 'id': client_id}
            
            # Отправляем подтверждение
            await websocket.send(json.dumps({
                'type': 'tournament_state',
                'data': self.tournament.get_tournament_state()
            }))
            
            # Уведомляем всех о новом участнике
            await self.broadcast_to_spectators({
                'type': 'player_joined',
                'data': {**player_data, 'id': client_id}
            })
            
        elif message_type == 'join_spectator':
            # Зритель присоединяется
            logger.info(f"👁️ Зритель присоединяется: {client_id}")
            client_type = 'spectator'
            self.tournament.spectators.add(client_id)
            self.clients[websocket] = {'type': 'spectator', 'id': client_id}
            
            logger.info(f"📊 Всего зрителей: {len(self.tournament.spectators)}")
            
            # Отправляем текущее состояние турнира
            await websocket.send(json.dumps({
                'type': 'tournament_state',
                'data': self.tournament.get_tournament_state()
            }))
            
        elif message_type == 'join_admin':
            # Админ присоединяется
            logger.info(f"👨‍💼 Админ присоединяется: {client_id}")
            client_type = 'admin'
            self.clients[websocket] = {'type': 'admin', 'id': client_id}
            
            # Отправляем текущее состояние турнира
            await websocket.send(json.dumps({
                'type': 'tournament_state',
                'data': self.tournament.get_tournament_state()
            }))
            
        elif message_type == 'player_update':
            # Обновление данных участника
            if websocket in self.clients and self.clients[websocket]['type'] == 'player':
                player_id = self.clients[websocket]['id']
                old_data = self.tournament.update_player(player_id, data.get('data', {}))
                
                # Уведомляем зрителей
                if old_data:
                    await self.broadcast_to_spectators({
                        'type': 'player_updated',
                        'data': {
                            'player_id': player_id,
                            'player_name': self.tournament.players[player_id].get('name', 'Unknown'),
                            'old_data': old_data,
                            'new_data': data.get('data', {})
                        }
                    })
                    
        elif message_type == 'player_action':
            # Действие участника
            if websocket in self.clients and self.clients[websocket]['type'] == 'player':
                player_id = self.clients[websocket]['id']
                player_name = self.tournament.players[player_id].get('name', 'Unknown')
                
                await self.broadcast_to_spectators({
                    'type': 'player_action',
                    'data': {
                        'player_id': player_id,
                        'player_name': player_name,
                        'action': data.get('data', {})
                    }
                })
                
        elif message_type == 'start_tournament':
            # Начать турнир
            self.tournament.start_tournament()
            await self.broadcast_to_all({
                'type': 'tournament_started',
                'data': {'start_time': self.tournament.tournament_start_time}
            })
            
        elif message_type == 'stop_tournament':
            # Остановить турнир
            self.tournament.stop_tournament()
            await self.broadcast_to_all({
                'type': 'tournament_stopped',
                'data': {'end_time': time.time()}
            })
            
    async def handle_disconnect(self, websocket, client_id):
        """Обработка отключения клиента"""
        if websocket in self.clients:
            client_info = self.clients[websocket]
            
            if client_info['type'] == 'player':
                # Участник отключился
                self.tournament.remove_player(client_id)
                
                # Уведомляем зрителей
                await self.broadcast_to_spectators({
                    'type': 'player_disconnected',
                    'data': {'player_id': client_id}
                })
                
            elif client_info['type'] == 'spectator':
                # Зритель отключился
                self.tournament.spectators.discard(client_id)
                
            elif client_info['type'] == 'admin':
                # Админ отключился
                logger.info(f"👨‍💼 Админ отключился: {client_id}")
                
            del self.clients[websocket]
            
    async def broadcast_to_spectators(self, message):
        """Отправить сообщение всем зрителям"""
        if not self.tournament.spectators:
            return
            
        message_str = json.dumps(message)
        for websocket, client_info in self.clients.items():
            if client_info['type'] == 'spectator':
                try:
                    await websocket.send(message_str)
                except websockets.exceptions.ConnectionClosed:
                    pass
                    
    async def broadcast_to_all(self, message):
        """Отправить сообщение всем клиентам"""
        message_str = json.dumps(message)
        for websocket in self.clients.keys():
            try:
                await websocket.send(message_str)
            except websockets.exceptions.ConnectionClosed:
                pass

class CustomHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Кастомный HTTP обработчик для CORS и маршрутизации"""
    
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
        """Обработка GET запросов с поддержкой API"""
        # API для получения состояния турнира
        if self.path == '/api/tournament/state':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            # Получаем данные турнира
            players = []
            for player_id, player_data in self.server.tournament.players.items():
                players.append({
                    'id': player_id,
                    'name': player_data.get('name', 'Unknown'),
                    'cash': player_data.get('cash', 0),
                    'assets_count': len(player_data.get('assets', [])),
                    'months_count': player_data.get('months_count', 0),
                    'salary': player_data.get('salary', 0),
                    'passive_income': player_data.get('passive_income', 0),
                    'total_income': player_data.get('total_income', 0),
                    'total_expenses': player_data.get('total_expenses', 0),
                    'flow': player_data.get('flow', 0),
                    'isOnline': player_data.get('is_online', False),
                    'lastUpdate': player_data.get('last_update', 0)
                })
            
            response = {
                'players': players,
                'isActive': self.server.tournament.is_active,
                'startTime': self.server.tournament.tournament_start_time,
                'totalPlayers': len(players),
                'onlinePlayers': len([p for p in players if p['isOnline']]),
                'onlineSpectators': len(self.server.tournament.spectators)
            }
            
            self.wfile.write(json.dumps(response).encode())
            return
            
        # API для подключения участника
        elif self.path.startswith('/api/player/join'):
            from urllib.parse import parse_qs, urlparse
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)
            name = params.get('name', ['Unknown'])[0]
            
            # Проверяем, существует ли уже участник с таким именем
            existing_player_id = None
            for player_id, player_data in self.server.tournament.players.items():
                if player_data.get('name') == name:
                    existing_player_id = player_id
                    break
            
            if existing_player_id:
                # Подключаем к существующему аккаунту
                existing_player = self.server.tournament.players[existing_player_id]
                existing_player['is_online'] = True
                existing_player['last_update'] = time.time()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                response = {
                    'playerId': existing_player_id,
                    'player': existing_player,
                    'message': 'Подключение к существующему аккаунту'
                }
                
                self.wfile.write(json.dumps(response).encode())
                return
            else:
                # Создаем нового участника
                player_id = f"player_{int(time.time() * 1000) % 1000000}"
                player_data = {
                    'name': name,
                    'cash': 0,
                    'assets': [],
                    'income': [],
                    'expenses': [],
                    'months_count': 0,
                    'salary': 0,
                    'passive_income': 0,
                    'total_income': 0,
                    'total_expenses': 0,
                    'flow': 0,
                    'is_online': True,
                    'last_update': time.time()
                }
                
                self.server.tournament.players[player_id] = player_data
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                
                response = {
                    'playerId': player_id,
                    'player': player_data,
                    'message': 'Создан новый аккаунт'
                }
                
                self.wfile.write(json.dumps(response).encode())
                return
            
        # API для обновления данных участника
        elif self.path.startswith('/api/player/update'):
            from urllib.parse import parse_qs, urlparse
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)
            
            player_id = params.get('player_id', [''])[0]
            if not player_id or player_id not in self.server.tournament.players:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Player not found'}).encode())
                return
            
            # Обновляем данные участника
            player = self.server.tournament.players[player_id]
            player['cash'] = int(params.get('cash', [0])[0])
            player['assets_count'] = int(params.get('assets_count', [0])[0])
            player['months_count'] = int(params.get('months_count', [0])[0])
            player['salary'] = int(params.get('salary', [0])[0])
            player['passive_income'] = int(params.get('passive_income', [0])[0])
            player['total_income'] = int(params.get('total_income', [0])[0])
            player['total_expenses'] = int(params.get('total_expenses', [0])[0])
            player['flow'] = int(params.get('flow', [0])[0])
            player['last_update'] = time.time()
            player['is_online'] = True
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {'success': True, 'player': player}
            self.wfile.write(json.dumps(response).encode())
            return
            

        
        # API для очистки всех участников (админ) - через GET с параметром
        elif self.path == '/api/admin/clear-players':
            # Очищаем всех участников
            self.server.tournament.players.clear()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {'status': 'success', 'message': 'Все участники очищены'}
            self.wfile.write(json.dumps(response).encode())
            return

        # API для начала турнира
        elif self.path == '/api/tournament/start':
            self.server.tournament.start_tournament()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {
                'status': 'success', 
                'message': 'Турнир начат',
                'start_time': self.server.tournament.tournament_start_time
            }
            self.wfile.write(json.dumps(response).encode())
            return

        # API для остановки турнира
        elif self.path == '/api/tournament/stop':
            self.server.tournament.stop_tournament()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {
                'status': 'success', 
                'message': 'Турнир остановлен'
            }
            self.wfile.write(json.dumps(response).encode())
            return



        # API для сброса времени турнира
        elif self.path == '/api/tournament/reset':
            self.server.tournament.reset_tournament()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {
                'status': 'success', 
                'message': 'Время турнира сброшено'
            }
            self.wfile.write(json.dumps(response).encode())
            return
            
        # Обычная обработка файлов
        else:
            super().do_GET()
    
    def do_POST(self):
        """Обработка POST запросов"""
        # API для очистки всех участников (админ)
        if self.path == '/api/admin/clear-players':
            # Очищаем всех участников
            self.server.tournament.players.clear()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            response = {'status': 'success', 'message': 'Все участники очищены'}
            self.wfile.write(json.dumps(response).encode())
            return
        
        # Если endpoint не найден
        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode())
        
    def translate_path(self, path):
        # Маршрутизация для зрительской страницы
        if path == '/spectator':
            return 'spectator/index.html'
        elif path == '/spectator/':
            return 'spectator/index.html'
        return super().translate_path(path)

async def main():
    """Основная функция сервера"""
    tournament = TournamentServer()
    handler = TournamentWebSocketHandler(tournament)
    
    # Запускаем WebSocket сервер
    ws_server = await websockets.serve(
        handler.handle_client,
        "0.0.0.0",  # Слушаем на всех интерфейсах
        8765,
        ping_interval=20,
        ping_timeout=10
    )
    
    logger.info("🚀 WebSocket сервер запущен на ws://0.0.0.0:8765")
    
    # Запускаем HTTP сервер в отдельном потоке
    def run_http_server():
        class TournamentHTTPServer(HTTPServer):
            def __init__(self, server_address, RequestHandlerClass, tournament):
                super().__init__(server_address, RequestHandlerClass)
                self.tournament = tournament
        
        httpd = TournamentHTTPServer(('0.0.0.0', 3000), CustomHTTPRequestHandler, tournament)
        logger.info("🌐 HTTP сервер запущен на http://0.0.0.0:3000")
        logger.info("📱 Участники: http://0.0.0.0:3000?tournament=true")
        logger.info("👁️ Зрители: http://0.0.0.0:3000/spectator")
        httpd.serve_forever()
    
    http_thread = threading.Thread(target=run_http_server, daemon=True)
    http_thread.start()
    
    # Ждем завершения
    await ws_server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("🛑 Сервер остановлен пользователем")
    except Exception as e:
        logger.error(f"❌ Ошибка сервера: {e}")
