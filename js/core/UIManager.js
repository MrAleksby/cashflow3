/**
 * UIManager - управление пользовательским интерфейсом
 * Реагирует на события и обновляет UI
 */
class UIManager {
    constructor() {
        this._initialized = false;
        this._updateQueue = new Set();
        this._isUpdating = false;
        
        // Привязываем методы к контексту
        this._handleCashChanged = this._handleCashChanged.bind(this);
        this._handleIncomeChanged = this._handleIncomeChanged.bind(this);
        this._handleExpenseChanged = this._handleExpenseChanged.bind(this);
        this._handleAssetChanged = this._handleAssetChanged.bind(this);
        this._handleLiabilityChanged = this._handleLiabilityChanged.bind(this);
        this._handleChildChanged = this._handleChildChanged.bind(this);
        this._handleJobChanged = this._handleJobChanged.bind(this);
        this._handleHistoryChanged = this._handleHistoryChanged.bind(this);
        this._handleMonthsChanged = this._handleMonthsChanged.bind(this);
        this._handleGameStateLoaded = this._handleGameStateLoaded.bind(this);
        this._handleGameReset = this._handleGameReset.bind(this);
    }

    /**
     * Инициализация UI-менеджера
     */
    init() {
        if (this._initialized) return;
        
        // Подписываемся на события
        this._subscribeToEvents();
        
        // Запускаем цикл обновления UI
        this._startUpdateLoop();
        
        this._initialized = true;
        console.log('✅ UIManager инициализирован');
    }

    /**
     * Подписка на события
     */
    _subscribeToEvents() {
        const { eventBus, AppEvents } = window;
        
        // События состояния игры
        eventBus.on(AppEvents.GAME_STATE_LOADED, this._handleGameStateLoaded);
        eventBus.on(AppEvents.GAME_RESET, this._handleGameReset);
        
        // События данных
        eventBus.on(AppEvents.CASH_CHANGED, this._handleCashChanged);
        eventBus.on(AppEvents.INCOME_CHANGED, this._handleIncomeChanged);
        eventBus.on(AppEvents.EXPENSE_CHANGED, this._handleExpenseChanged);
        eventBus.on(AppEvents.ASSET_CHANGED, this._handleAssetChanged);
        eventBus.on(AppEvents.LIABILITY_CHANGED, this._handleLiabilityChanged);
        eventBus.on(AppEvents.CHILD_CHANGED, this._handleChildChanged);
        eventBus.on(AppEvents.JOB_CHANGED, this._handleJobChanged);
        eventBus.on(AppEvents.HISTORY_CHANGED, this._handleHistoryChanged);
        eventBus.on(AppEvents.MONTHS_INCREMENTED, this._handleMonthsChanged);
    }

    /**
     * Запуск цикла обновления UI
     */
    _startUpdateLoop() {
        // Обновляем UI каждые 100ms, если есть изменения
        setInterval(() => {
            if (this._updateQueue.size > 0 && !this._isUpdating) {
                this._processUpdateQueue();
            }
        }, 100);
    }

    /**
     * Обработка очереди обновлений
     */
    _processUpdateQueue() {
        this._isUpdating = true;
        
        const updates = Array.from(this._updateQueue);
        this._updateQueue.clear();
        
        // Группируем обновления по типам
        const groupedUpdates = this._groupUpdates(updates);
        
        // Выполняем обновления
        for (const [type, data] of Object.entries(groupedUpdates)) {
            try {
                this._performUpdate(type, data);
            } catch (error) {
                console.error(`Ошибка при обновлении UI (${type}):`, error);
            }
        }
        
        this._isUpdating = false;
    }

    /**
     * Группировка обновлений по типам
     */
    _groupUpdates(updates) {
        const grouped = {};
        
        for (const update of updates) {
            if (!grouped[update.type]) {
                grouped[update.type] = [];
            }
            grouped[update.type].push(update.data);
        }
        
        return grouped;
    }

    /**
     * Выполнение обновления
     */
    _performUpdate(type, dataArray) {
        switch (type) {
            case 'cash':
                this._updateCashDisplay(dataArray[dataArray.length - 1]);
                break;
            case 'summary':
                this._updateSummary();
                break;
            case 'income':
                this._updateIncomeList();
                break;
            case 'expense':
                this._updateExpenseList();
                break;
            case 'asset':
                this._updateAssetList();
                break;
            case 'liability':
                this._updateLiabilityList();
                break;
            case 'history':
                this._updateHistoryList();
                break;
            case 'months':
                this._updateMonthsCounter(dataArray[dataArray.length - 1]);
                break;
            case 'job':
                this._updateJobDisplay(dataArray[dataArray.length - 1]);
                break;
            case 'full':
                this._updateAll();
                break;
        }
    }

    /**
     * Добавить обновление в очередь
     */
    _queueUpdate(type, data = null) {
        this._updateQueue.add({ type, data });
    }

    // === ОБРАБОТЧИКИ СОБЫТИЙ ===

    _handleGameStateLoaded(data) {
        this._queueUpdate('full');
    }

    _handleGameReset() {
        this._queueUpdate('full');
    }

    _handleCashChanged(data) {
        this._queueUpdate('cash', data);
        this._queueUpdate('summary');
    }

    _handleIncomeChanged(data) {
        this._queueUpdate('income');
        this._queueUpdate('summary');
    }

    _handleExpenseChanged(data) {
        this._queueUpdate('expense');
        this._queueUpdate('summary');
    }

    _handleAssetChanged(data) {
        this._queueUpdate('asset');
    }

    _handleLiabilityChanged(data) {
        this._queueUpdate('liability');
    }

    _handleChildChanged(data) {
        this._queueUpdate('expense');
        this._queueUpdate('summary');
    }

    _handleJobChanged(data) {
        this._queueUpdate('job', data);
        this._queueUpdate('income');
        this._queueUpdate('summary');
    }

    _handleHistoryChanged(data) {
        this._queueUpdate('history');
    }

    _handleMonthsChanged(data) {
        this._queueUpdate('months', data);
    }

    // === МЕТОДЫ ОБНОВЛЕНИЯ UI ===

    /**
     * Обновить отображение денег
     */
    _updateCashDisplay(data) {
        if (!window.DOM || !window.gameState) return;
        
        const cash = window.gameState.cash;
        window.DOM.setText('top-cash-amount', cash);
        
        // Обновляем в модальных окнах
        window.DOM.setText('modal-wallet-amount', cash);
        window.DOM.setText('modal-action-wallet-amount', cash);
    }

    /**
     * Обновить сводку
     */
    _updateSummary() {
        if (!window.DOM || !window.gameState) return;
        
        const state = window.gameState;
        
        // Зарплата
        const salary = state.data.job.salary || 0;
        window.DOM.setText('salary-value', salary);
        
        // Пассивный доход
        const passiveIncome = state.calculatePassiveIncome();
        window.DOM.setText('passive-value', passiveIncome);
        
        // Общий доход
        const totalIncome = state.calculateTotalIncome();
        window.DOM.setText('income-sum', totalIncome);
        
        // Общий расход
        const totalExpense = state.calculateTotalExpense();
        window.DOM.setText('expense-sum', totalExpense);
        
        // Поток наличности
        const cashflow = state.calculateCashflow();
        window.DOM.setText('cashflow', cashflow);
    }

    /**
     * Обновить список доходов
     */
    _updateIncomeList() {
        if (!window.DOM || !window.gameState) return;
        
        const incomeList = window.DOM.get('income-list');
        const incomeTotal = window.DOM.get('income-total');
        
        if (!incomeList || !incomeTotal) return;
        
        const income = window.gameState.data.income;
        
        if (income.length === 0) {
            window.DOM.setHTML('income-list', '<li style="color:#888;">Нет доходов</li>');
            window.DOM.setText('income-total', '0');
            return;
        }
        
        const total = window.gameState.calculateTotalIncome();
        const html = income.map(inc => 
            `<li>${inc.name} <span style='float:right;'>${inc.value}</span></li>`
        ).join('');
        
        window.DOM.setHTML('income-list', html);
        window.DOM.setText('income-total', total);
    }

    /**
     * Обновить список расходов
     */
    _updateExpenseList() {
        if (!window.DOM || !window.gameState) return;
        
        const expenseList = window.DOM.get('expense-list');
        const expenseTotal = window.DOM.get('expense-total');
        
        if (!expenseList || !expenseTotal) return;
        
        const expense = window.gameState.data.expense;
        
        if (expense.length === 0) {
            window.DOM.setHTML('expense-list', '<li style="color:#888;">Нет расходов</li>');
            window.DOM.setText('expense-total', '0');
            return;
        }
        
        const total = window.gameState.calculateTotalExpense();
        const html = expense.map(exp => 
            `<li>${exp.name} <span style='float:right;'>${exp.value}</span></li>`
        ).join('');
        
        window.DOM.setHTML('expense-list', html);
        window.DOM.setText('expense-total', total);
    }

    /**
     * Обновить список активов
     */
    _updateAssetList() {
        if (!window.DOM || !window.gameState) return;
        
        const assetList = window.DOM.get('asset-list');
        const assetTotal = window.DOM.get('asset-total');
        
        if (!assetList || !assetTotal) return;
        
        const assets = window.gameState.data.asset;
        
        if (assets.length === 0) {
            window.DOM.setHTML('asset-list', '<li style="color:#888;">Нет активов</li>');
            window.DOM.setText('asset-total', '0');
            return;
        }
        
        const total = window.gameState.calculateTotalAssets();
        const html = assets.map(asset => {
            let value = 0;
            let displayText = '';
            
            if (asset.type === 'stocks') {
                value = (asset.quantity || 0) * (asset.price || 0);
                displayText = `${asset.name} (${asset.quantity} шт. по $${asset.price}/шт)`;
            } else {
                value = Number(asset.value) || 0;
                displayText = asset.name;
            }
            
            return `<li>${displayText} <span style='float:right;'>$${value}</span></li>`;
        }).join('');
        
        window.DOM.setHTML('asset-list', html);
        window.DOM.setText('asset-total', total);
    }

    /**
     * Обновить список пассивов
     */
    _updateLiabilityList() {
        if (!window.DOM || !window.gameState) return;
        
        const liabilityList = window.DOM.get('liability-list');
        const liabilityTotal = window.DOM.get('liability-total');
        
        if (!liabilityList || !liabilityTotal) return;
        
        const liabilities = window.gameState.data.liability;
        
        if (liabilities.length === 0) {
            window.DOM.setHTML('liability-list', '<li style="color:#888;">Нет пассивов</li>');
            window.DOM.setText('liability-total', '0');
            return;
        }
        
        const total = window.gameState.calculateTotalLiabilities();
        const html = liabilities.map(liab => 
            `<li>${liab.name} <span style='float:right;'>${liab.value}</span></li>`
        ).join('');
        
        window.DOM.setHTML('liability-list', html);
        window.DOM.setText('liability-total', total);
    }

    /**
     * Обновить список истории
     */
    _updateHistoryList() {
        if (!window.DOM || !window.gameState) return;
        
        const historyContainer = window.DOM.get('history-container');
        if (!historyContainer) return;
        
        const history = window.gameState.data.history;
        
        if (history.length === 0) {
            window.DOM.setHTML('history-container', '<div class="history-empty">История операций пуста</div>');
            return;
        }
        
        const html = history.slice(-20).reverse().map(entry => {
            const date = new Date(entry.timestamp).toLocaleString();
            return `<div class="history-item">
                <div class="history-date">${date}</div>
                <div class="history-description">${entry.description || entry.type}</div>
                ${entry.amount ? `<div class="history-amount">$${entry.amount}</div>` : ''}
            </div>`;
        }).join('');
        
        window.DOM.setHTML('history-container', html);
    }

    /**
     * Обновить счетчик месяцев
     */
    _updateMonthsCounter(data) {
        if (!window.DOM || !window.gameState) return;
        
        const monthsCount = window.gameState.data.monthsCount;
        window.DOM.setText('months-counter', monthsCount);
    }

    /**
     * Обновить отображение работы
     */
    _updateJobDisplay(data) {
        if (!window.DOM || !window.gameState) return;
        
        const job = window.gameState.data.job;
        const quitBtn = window.DOM.get('quit-job-btn');
        
        if (quitBtn) {
            quitBtn.disabled = !job.title || job.salary <= 0;
        }
    }

    /**
     * Обновить все элементы UI
     */
    _updateAll() {
        this._updateCashDisplay();
        this._updateSummary();
        this._updateIncomeList();
        this._updateExpenseList();
        this._updateAssetList();
        this._updateLiabilityList();
        this._updateHistoryList();
        this._updateMonthsCounter();
        this._updateJobDisplay();
    }
}

// Создаем глобальный экземпляр UIManager
window.uiManager = new UIManager();
