/**
 * TournamentSync - синхронизация с турнирным сервером
 * Отправляет все действия участника в реальном времени
 */
class TournamentSync {
    constructor() {
        this.playerId = this.generatePlayerId();
        this.playerName = this.generatePlayerName();
        this.isConnected = false;
        this.isTournamentMode = false;
        
        this.init();
    }

    /**
     * Инициализация турнирной синхронизации
     */
    init() {
        // Проверяем, включен ли турнирный режим
        this.isTournamentMode = window.location.search.includes('tournament=true');
        
        if (!this.isTournamentMode) {
            console.log('🎮 Турнирный режим не включен');
            return;
        }

        console.log('🏆 Турнирный режим активирован!');
        
        // Показываем модальное окно для ввода имени
        this.showPlayerNameModal();
    }

    /**
     * Генерация уникального ID участника
     */
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Генерация имени участника
     */
    generatePlayerName() {
        const names = [
            'Алексей', 'Мария', 'Дмитрий', 'Анна', 'Сергей',
            'Елена', 'Андрей', 'Ольга', 'Иван', 'Татьяна',
            'Михаил', 'Наталья', 'Владимир', 'Ирина', 'Николай'
        ];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomNumber = Math.floor(Math.random() * 100);
        return `${randomName} ${randomNumber}`;
    }

    /**
     * Показать модальное окно для ввода имени
     */
    showPlayerNameModal() {
        const modal = document.getElementById('player-name-modal');
        const input = document.getElementById('player-name-input');
        
        if (modal && input) {
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
     * Закрыть модальное окно имени
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
        const name = input?.value?.trim();
        
        if (!name || name.length < 2) {
            this.showTournamentError('Пожалуйста, введите имя (минимум 2 символа)');
            input?.focus();
            return;
        }
        
        if (name.length > 30) {
            this.showTournamentError('Имя слишком длинное (максимум 30 символов)');
            input?.focus();
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
            
            // Отправляем обновления каждые 5 секунд
            setInterval(() => {
                this.sendPlayerUpdate();
            }, 5000);
            
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
            
            if (data.status === 'success') {
                this.playerId = data.player_id;
                console.log('🎯 Присоединились к турниру:', this.playerName);
                this.showTournamentNotification(`Присоединились к турниру как ${this.playerName}`);
                
                // Сразу отправляем первое обновление
                this.sendPlayerUpdate();
            } else {
                console.error('❌ Ошибка подключения к турниру:', data.message);
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

        // Альтернативный способ - слушаем изменения в DOM
        this.observeGameChanges();
    }

    /**
     * Наблюдение за изменениями в игре
     */
    observeGameChanges() {
        // Создаем наблюдатель за изменениями в DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'attributes') {
                    // Проверяем, изменились ли важные элементы
                    this.checkForGameChanges();
                }
            });
        });

        // Начинаем наблюдение
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-value', 'textContent']
        });
    }

    /**
     * Проверка изменений в игре
     */
    checkForGameChanges() {
        // Проверяем изменения баланса
        const cashElement = document.getElementById('top-cash-amount');
        if (cashElement) {
            const currentCash = parseInt(cashElement.textContent) || 0;
            if (this.lastCash !== currentCash) {
                this.lastCash = currentCash;
                this.sendPlayerUpdate();
            }
        }

        // Проверяем изменения счетчика месяцев
        const monthsElement = document.getElementById('months-counter');
        if (monthsElement) {
            const currentMonths = parseInt(monthsElement.textContent) || 0;
            if (this.lastMonths !== currentMonths) {
                this.lastMonths = currentMonths;
                this.sendPlayerUpdate();
            }
        }
    }

    /**
     * Отправка обновления данных участника
     */
    async sendPlayerUpdate() {
        if (!this.isConnected) return;

        try {
            const updateData = {
                cash: window.gameState?.cash || this.lastCash || 0,
                assets: window.gameState?.data?.asset || [],
                income: window.gameState?.data?.income || [],
                expenses: window.gameState?.data?.expense || [],
                monthsCount: window.gameState?.data?.monthsCount || this.lastMonths || 0
            };

            // Отправляем через HTTP API
            const response = await fetch(`/api/player/update?player_id=${this.playerId}&cash=${updateData.cash}&assets_count=${updateData.assets.length}&months_count=${updateData.monthsCount}`);
            
            if (response.ok) {
                console.log('📊 Данные обновлены:', updateData);
            } else {
                console.error('❌ Ошибка обновления данных');
            }
        } catch (error) {
            console.error('❌ Ошибка отправки данных:', error);
        }
    }

    /**
     * Отправка действия участника
     */
    sendPlayerAction(actionType, description = '') {
        if (!this.isConnected) return;

        const actionData = {
            type: actionType,
            description: description,
            timestamp: Date.now()
        };

        // Логируем действие локально
        console.log('🎯 Действие участника:', actionType, description);
        
        // Можно добавить отправку через API если нужно
        // this.sendPlayerUpdate();
    }



    /**
     * Показать уведомление о турнире
     */
    showTournamentNotification(message) {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = 'tournament-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-trophy"></i>
                <span>${message}</span>
            </div>
        `;

        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, #4ade80, #22c55e);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            animation: slideDown 0.5s ease-out;
        `;

        // Добавляем анимацию
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Убираем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.5s ease-in';
            notification.style.animationFillMode = 'forwards';
            
            const slideUpStyle = document.createElement('style');
            slideUpStyle.textContent = `
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(0); opacity: 1; }
                    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                }
            `;
            document.head.appendChild(slideUpStyle);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }

    /**
     * Показать ошибку турнира
     */
    showTournamentError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'tournament-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;

        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #ef4444, #dc2626);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: bold;
            max-width: 300px;
        `;

        document.body.appendChild(errorDiv);

        // Убираем через 5 секунд
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }

    /**
     * Получить текущие данные игрока
     */
    getCurrentPlayerData() {
        return {
            id: this.playerId,
            name: this.playerName,
            cash: window.gameState?.cash || this.lastCash || 0,
            assets: window.gameState?.data?.asset || [],
            income: window.gameState?.data?.income || [],
            expenses: window.gameState?.data?.expense || [],
            monthsCount: window.gameState?.data?.monthsCount || this.lastMonths || 0
        };
    }

    /**
     * Отключение от турнира
     */
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
    }
}

// Автоматическая инициализация при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.search.includes('tournament=true')) {
            window.tournamentSync = new TournamentSync();
        }
    });
} else {
    if (window.location.search.includes('tournament=true')) {
        window.tournamentSync = new TournamentSync();
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TournamentSync;
}
