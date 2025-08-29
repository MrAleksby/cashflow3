/**
 * EventBus - централизованная система событий
 * Обеспечивает слабую связанность между модулями приложения
 */
class EventBus {
    constructor() {
        this._events = new Map();
        this._middleware = [];
        this._debug = false; // Включить для отладки
    }

    /**
     * Подписаться на событие
     * @param {string} event - название события
     * @param {Function} callback - функция-обработчик
     * @param {Object} options - опции (once: true для однократного выполнения)
     * @returns {Function} - функция для отписки
     */ачит в
    on(event, callback, options = {}) {
        if (!this._events.has(event)) {
            this._events.set(event, []);
        }

        const listener = {
            callback,
            once: options.once || false,
            id: this._generateId()
        };

        this._events.get(event).push(listener);

        if (this._debug) {
            console.log(`📡 Подписка на событие: ${event} (ID: ${listener.id})`);
        }

        // Возвращаем функцию для отписки
        return () => this.off(event, callback);
    }

    /**
     * Подписаться на событие один раз
     * @param {string} event - название события
     * @param {Function} callback - функция-обработчик
     * @returns {Function} - функция для отписки
     */
    once(event, callback) {
        return this.on(event, callback, { once: true });
    }

    /**
     * Отписаться от события
     * @param {string} event - название события
     * @param {Function} callback - функция-обработчик
     */
    off(event, callback) {
        if (!this._events.has(event)) return;

        const listeners = this._events.get(event);
        const index = listeners.findIndex(listener => listener.callback === callback);
        
        if (index !== -1) {
            const removed = listeners.splice(index, 1)[0];
            if (this._debug) {
                console.log(`📡 Отписка от события: ${event} (ID: ${removed.id})`);
            }
        }
    }

    /**
     * Отписаться от всех событий
     * @param {string} event - название события (если не указано, отписываемся от всех)
     */
    offAll(event = null) {
        if (event) {
            this._events.delete(event);
            if (this._debug) {
                console.log(`📡 Отписка от всех слушателей события: ${event}`);
            }
        } else {
            this._events.clear();
            if (this._debug) {
                console.log('📡 Отписка от всех событий');
            }
        }
    }

    /**
     * Отправить событие
     * @param {string} event - название события
     * @param {*} data - данные события
     * @param {Object} options - опции (async: true для асинхронного выполнения)
     */
    emit(event, data = null, options = {}) {
        if (this._debug) {
            console.log(`📡 Событие: ${event}`, data);
        }

        // Применяем middleware
        let processedData = data;
        for (const middleware of this._middleware) {
            try {
                processedData = middleware(event, processedData);
            } catch (error) {
                console.error(`Ошибка в middleware для события ${event}:`, error);
            }
        }

        if (!this._events.has(event)) {
            if (this._debug) {
                console.log(`📡 Нет слушателей для события: ${event}`);
            }
            return;
        }

        const listeners = this._events.get(event);
        const toRemove = [];

        // Выполняем обработчики
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            
            try {
                if (options.async) {
                    // Асинхронное выполнение
                    Promise.resolve().then(() => {
                        listener.callback(processedData);
                    }).catch(error => {
                        console.error(`Ошибка в асинхронном обработчике события ${event}:`, error);
                    });
                } else {
                    // Синхронное выполнение
                    listener.callback(processedData);
                }

                // Помечаем для удаления если это once-слушатель
                if (listener.once) {
                    toRemove.push(i);
                }
            } catch (error) {
                console.error(`Ошибка в обработчике события ${event}:`, error);
            }
        }

        // Удаляем once-слушатели
        for (let i = toRemove.length - 1; i >= 0; i--) {
            listeners.splice(toRemove[i], 1);
        }
    }

    /**
     * Добавить middleware
     * @param {Function} middleware - функция middleware
     */
    use(middleware) {
        this._middleware.push(middleware);
    }

    /**
     * Включить/выключить отладку
     * @param {boolean} enabled - включить отладку
     */
    setDebug(enabled) {
        this._debug = enabled;
    }

    /**
     * Получить количество слушателей события
     * @param {string} event - название события
     * @returns {number} - количество слушателей
     */
    getListenerCount(event) {
        return this._events.has(event) ? this._events.get(event).length : 0;
    }

    /**
     * Получить список всех событий
     * @returns {Array} - массив названий событий
     */
    getEvents() {
        return Array.from(this._events.keys());
    }

    /**
     * Генерация уникального ID
     * @returns {string} - уникальный ID
     */
    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Создаем глобальный экземпляр EventBus
window.eventBus = new EventBus();

// Включаем отладку в режиме разработки
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.eventBus.setDebug(true);
}

// Добавляем middleware для логирования ошибок
window.eventBus.use((event, data) => {
    // Можно добавить дополнительную обработку данных
    return data;
});

// Предопределенные события приложения
window.AppEvents = {
    // События состояния игры
    GAME_STATE_LOADED: 'game:state:loaded',
    GAME_STATE_SAVED: 'game:state:saved',
    GAME_RESET: 'game:reset',
    
    // События денег
    CASH_CHANGED: 'cash:changed',
    CASH_ADDED: 'cash:added',
    CASH_REMOVED: 'cash:removed',
    
    // События доходов
    INCOME_ADDED: 'income:added',
    INCOME_REMOVED: 'income:removed',
    INCOME_CHANGED: 'income:changed',
    
    // События расходов
    EXPENSE_ADDED: 'expense:added',
    EXPENSE_REMOVED: 'expense:removed',
    EXPENSE_CHANGED: 'expense:changed',
    
    // События активов
    ASSET_ADDED: 'asset:added',
    ASSET_REMOVED: 'asset:removed',
    ASSET_CHANGED: 'asset:changed',
    
    // События пассивов
    LIABILITY_ADDED: 'liability:added',
    LIABILITY_REMOVED: 'liability:removed',
    LIABILITY_CHANGED: 'liability:changed',
    
    // События детей
    CHILD_ADDED: 'child:added',
    CHILD_REMOVED: 'child:removed',
    CHILD_CHANGED: 'child:changed',
    
    // События работы
    JOB_SET: 'job:set',
    JOB_QUIT: 'job:quit',
    JOB_CHANGED: 'job:changed',
    
    // События истории
    HISTORY_ADDED: 'history:added',
    HISTORY_CLEARED: 'history:cleared',
    
    // События месяцев
    MONTHS_INCREMENTED: 'months:incremented',
    
    // События UI
    UI_UPDATE_REQUIRED: 'ui:update:required',
    UI_SCREEN_CHANGED: 'ui:screen:changed',
    UI_MODAL_OPENED: 'ui:modal:opened',
    UI_MODAL_CLOSED: 'ui:modal:closed',
    
    // События PayDay
    PAYDAY_TRIGGERED: 'payday:triggered',
    PAYDAY_COMPLETED: 'payday:completed',
    
    // События ошибок
    ERROR_OCCURRED: 'error:occurred',
    VALIDATION_FAILED: 'validation:failed'
};
