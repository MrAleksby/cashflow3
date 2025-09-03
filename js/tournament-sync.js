/**
 * Простая система синхронизации турнира
 * Без сложной логики восстановления - только базовое подключение
 */

class TournamentSync {
    constructor() {
        this.playerId = null;
        this.playerName = null;
        this.isConnected = false;
        this.isTournamentMode = false;
        
        this.init();
    }

    init() {
        // Проверяем, включен ли турнирный режим
        this.isTournamentMode = window.location.search.includes('tournament=true');
        
        if (!this.isTournamentMode) {
            console.log('🎮 Турнирный режим не включен');
            return;
        }

        console.log('🏆 Турнирный режим активирован!');
        
        // Всегда показываем модальное окно для ввода имени
        this.showPlayerNameModal();
    }

    /**
     * Показать модальное окно для ввода имени
     */
    showPlayerNameModal() {
        const modal = document.getElementById('player-name-modal');
        const input = document.getElementById('player-name-input');
        
        if (modal && input) {
            // Очищаем поле ввода
            input.value = '';
            input.placeholder = 'Введите ваше имя';
            
            modal.classList.add('active');
            input.focus();
            
            // Обработка Enter для быстрого входа
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.joinWithCustomName();
                }
            });
            
            // Обработка Escape для закрытия
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closePlayerNameModal();
                }
            });
        }
    }

    /**
     * Закрыть модальное окно
     */
    closePlayerNameModal() {
        const modal = document.getElementById('player-name-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Присоединиться с пользовательским именем
     */
    joinWithCustomName() {
        const input = document.getElementById('player-name-input');
        const name = input.value.trim();
        
        if (!name) {
            alert('Пожалуйста, введите имя!');
            return;
        }
        
        // Устанавливаем пользовательское имя
        this.playerName = name;
        console.log('✅ Установлено пользовательское имя:', name);
        
        // Закрываем модальное окно и подключаемся к серверу
        this.closePlayerNameModal();
        this.connectToServer();
    }

    /**
     * Использовать случайное имя
     */
    useRandomName() {
        this.playerName = this.generatePlayerName();
        console.log('🎲 Используем случайное имя:', this.playerName);
        
        // Закрываем модальное окно и подключаемся к серверу
        this.closePlayerNameModal();
        this.connectToServer();
    }

    /**
     * Подключение к турнирному серверу
     */
    connectToServer() {
        try {
            console.log('✅ Подключение к турнирному API');
            this.isConnected = true;
            this.setupEventListeners();
            this.joinTournament();
            
            // Отправляем обновления каждые 3 секунды
            setInterval(() => {
                this.sendPlayerUpdate();
            }, 3000);
            
        } catch (error) {
            console.error('❌ Ошибка подключения к API:', error);
            this.showTournamentError('Ошибка подключения к турнирному серверу');
        }
    }

    /**
     * Присоединение к турниру
     */
    async joinTournament() {
        if (!this.isConnected) return;

        try {
            // Отправляем запрос на подключение через HTTP API
            const response = await fetch(`/api/player/join?name=${encodeURIComponent(this.playerName)}`);
            const data = await response.json();
            
            if (data.playerId) {
                this.playerId = data.playerId;
                console.log('🎯 Присоединились к турниру:', this.playerName, 'с ID:', this.playerId);
                
                this.showTournamentNotification(`Присоединились к турниру как ${this.playerName}`);
                
                // Сразу отправляем первое обновление
                this.sendPlayerUpdate();
            } else {
                console.error('❌ Ошибка подключения к турниру:', data);
            }
        } catch (error) {
            console.error('❌ Ошибка подключения к турниру:', error);
        }
    }

    /**
     * Настройка слушателей событий
     */
    setupEventListeners() {
        // Слушаем изменения в игре
        if (window.eventBus) {
            window.eventBus.on('cashChanged', (data) => {
                this.sendPlayerUpdate();
            });
            
            window.eventBus.on('assetChanged', (data) => {
                this.sendPlayerUpdate();
            });
            
            window.eventBus.on('incomeChanged', (data) => {
                this.sendPlayerUpdate();
            });
            
            window.eventBus.on('expenseChanged', (data) => {
                this.sendPlayerUpdate();
            });
        }
    }

    /**
     * Отправка обновления данных участника
     */
    async sendPlayerUpdate() {
        if (!this.isConnected || !this.playerId) {
            return;
        }

        try {
            // Получаем данные из игры
            const cash = window.cash || 0;
            const assets = window.data?.asset || [];
            const income = window.data?.income || [];
            const expenses = window.data?.expense || [];
            const monthsCount = window.data?.monthsCount || 0;

            // Вычисляем финансовые показатели
            let totalIncome = 0;
            let totalExpenses = 0;
            let salary = 0;
            let passiveIncome = 0;
            let flow = 0;

            if (window.data) {
                totalIncome = (window.data.income || []).reduce((sum, item) => sum + (item.value || 0), 0);
                totalExpenses = (window.data.expense || []).reduce((sum, item) => sum + (item.value || 0), 0);
                passiveIncome = (window.data.income || []).reduce((sum, item) => {
                    if (item.type === 'passive') {
                        return sum + (item.value || 0);
                    }
                    return sum;
                }, 0);
                salary = totalIncome - passiveIncome;
                flow = totalIncome - totalExpenses;
            } else {
                // Fallback значения
                salary = 5000;
                passiveIncome = 1000;
                totalIncome = salary + passiveIncome;
                totalExpenses = 2000;
                flow = totalIncome - totalExpenses;
            }

            // Отправляем через HTTP API
            const queryParams = new URLSearchParams({
                player_id: this.playerId,
                cash: cash,
                assets_count: assets.length,
                months_count: monthsCount,
                salary: salary,
                passive_income: passiveIncome,
                total_income: totalIncome,
                total_expenses: totalExpenses,
                flow: flow
            });

            const response = await fetch(`/api/player/update?${queryParams}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('✅ Данные участника обновлены');
                }
            }
        } catch (error) {
            console.error('❌ Ошибка обновления данных:', error);
        }
    }

    /**
     * Показать уведомление
     */
    showTournamentNotification(message) {
        // Создаем простое уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4ade80;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    /**
     * Показать ошибку
     */
    showTournamentError(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Генерация случайного имени
     */
    generatePlayerName() {
        const names = ['Алексей', 'Мария', 'Дмитрий', 'Анна', 'Сергей', 'Елена', 'Андрей', 'Ольга', 'Владимир', 'Наталья'];
        const randomIndex = Math.floor(Math.random() * names.length);
        return names[randomIndex];
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.tournamentSync = new TournamentSync();
});
