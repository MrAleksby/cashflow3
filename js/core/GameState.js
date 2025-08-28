/**
 * GameState - централизованное управление состоянием игры
 * Заменяет глобальные переменные window.cash и window.data
 */
class GameState {
    constructor() {
        // Инициализация состояния
        this._cash = 0;
        this._data = {
            income: [],
            expense: [],
            asset: [],
            liability: [],
            children: [],
            history: [],
            monthsCount: 0,
            job: {
                title: '',
                salary: 0
            }
        };
        
        // Слушатели событий для обновления UI
        this._listeners = new Map();
        
        // Автосохранение при изменениях
        this._autoSave = true;
    }

    // === ГЕТТЕРЫ И СЕТТЕРЫ ===
    
    get cash() {
        return this._cash;
    }

    set cash(value) {
        const oldValue = this._cash;
        this._cash = Number(value) || 0;
        
        // Уведомляем слушателей об изменении
        this._notifyListeners('cashChanged', {
            oldValue,
            newValue: this._cash
        });
        
        // Автосохранение
        if (this._autoSave) {
            this.save();
        }
    }

    get data() {
        return this._data;
    }

    // === МЕТОДЫ ДЛЯ РАБОТЫ С ДЕНЬГАМИ ===
    
    /**
     * Добавить деньги в кошелек
     * @param {number} amount - сумма для добавления
     * @param {string} description - описание операции
     */
    addCash(amount, description = '') {
        const oldCash = this._cash;
        this._cash += Number(amount) || 0;
        
        // Добавляем в историю
        this.addHistory({
            type: 'cash_add',
            amount: amount,
            description: description,
            timestamp: new Date().toISOString()
        });
        
        this._notifyListeners('cashChanged', {
            oldValue: oldCash,
            newValue: this._cash,
            operation: 'add',
            amount: amount
        });
        
        if (this._autoSave) this.save();
    }

    /**
     * Убрать деньги из кошелька
     * @param {number} amount - сумма для вычитания
     * @param {string} description - описание операции
     */
    removeCash(amount, description = '') {
        const oldCash = this._cash;
        const amountToRemove = Number(amount) || 0;
        
        if (this._cash >= amountToRemove) {
            this._cash -= amountToRemove;
            
            // Добавляем в историю
            this.addHistory({
                type: 'cash_remove',
                amount: amountToRemove,
                description: description,
                timestamp: new Date().toISOString()
            });
            
            this._notifyListeners('cashChanged', {
                oldValue: oldCash,
                newValue: this._cash,
                operation: 'remove',
                amount: amountToRemove
            });
            
            if (this._autoSave) this.save();
            return true;
        }
        return false; // Недостаточно средств
    }

    // === МЕТОДЫ ДЛЯ РАБОТЫ С ДОХОДАМИ ===
    
    addIncome(income) {
        const newIncome = {
            id: this._generateId(),
            ...income,
            timestamp: new Date().toISOString()
        };
        
        this._data.income.push(newIncome);
        
        this._notifyListeners('incomeChanged', {
            operation: 'add',
            income: newIncome
        });
        
        if (this._autoSave) this.save();
        return newIncome;
    }

    removeIncome(incomeId) {
        const index = this._data.income.findIndex(inc => inc.id === incomeId);
        if (index !== -1) {
            const removedIncome = this._data.income.splice(index, 1)[0];
            
            this._notifyListeners('incomeChanged', {
                operation: 'remove',
                income: removedIncome
            });
            
            if (this._autoSave) this.save();
            return removedIncome;
        }
        return null;
    }

    // === МЕТОДЫ ДЛЯ РАБОТЫ С РАСХОДАМИ ===
    
    addExpense(expense) {
        const newExpense = {
            id: this._generateId(),
            ...expense,
            timestamp: new Date().toISOString()
        };
        
        this._data.expense.push(newExpense);
        
        this._notifyListeners('expenseChanged', {
            operation: 'add',
            expense: newExpense
        });
        
        if (this._autoSave) this.save();
        return newExpense;
    }

    removeExpense(expenseId) {
        const index = this._data.expense.findIndex(exp => exp.id === expenseId);
        if (index !== -1) {
            const removedExpense = this._data.expense.splice(index, 1)[0];
            
            this._notifyListeners('expenseChanged', {
                operation: 'remove',
                expense: removedExpense
            });
            
            if (this._autoSave) this.save();
            return removedExpense;
        }
        return null;
    }

    // === МЕТОДЫ ДЛЯ РАБОТЫ С АКТИВАМИ ===
    
    addAsset(asset) {
        const newAsset = {
            id: this._generateId(),
            ...asset,
            timestamp: new Date().toISOString()
        };
        
        this._data.asset.push(newAsset);
        
        this._notifyListeners('assetChanged', {
            operation: 'add',
            asset: newAsset
        });
        
        if (this._autoSave) this.save();
        return newAsset;
    }

    removeAsset(assetId) {
        const index = this._data.asset.findIndex(asset => asset.id === assetId);
        if (index !== -1) {
            const removedAsset = this._data.asset.splice(index, 1)[0];
            
            this._notifyListeners('assetChanged', {
                operation: 'remove',
                asset: removedAsset
            });
            
            if (this._autoSave) this.save();
            return removedAsset;
        }
        return null;
    }

    // === МЕТОДЫ ДЛЯ РАБОТЫ С ПАССИВАМИ ===
    
    addLiability(liability) {
        const newLiability = {
            id: this._generateId(),
            ...liability,
            timestamp: new Date().toISOString()
        };
        
        this._data.liability.push(newLiability);
        
        this._notifyListeners('liabilityChanged', {
            operation: 'add',
            liability: newLiability
        });
        
        if (this._autoSave) this.save();
        return newLiability;
    }

    removeLiability(liabilityId) {
        const index = this._data.liability.findIndex(liab => liab.id === liabilityId);
        if (index !== -1) {
            const removedLiability = this._data.liability.splice(index, 1)[0];
            
            this._notifyListeners('liabilityChanged', {
                operation: 'remove',
                liability: removedLiability
            });
            
            if (this._autoSave) this.save();
            return removedLiability;
        }
        return null;
    }

    // === МЕТОДЫ ДЛЯ РАБОТЫ С ДЕТЬМИ ===
    
    addChild(child) {
        const newChild = {
            id: this._generateId(),
            ...child,
            timestamp: new Date().toISOString()
        };
        
        this._data.children.push(newChild);
        
        // Автоматически добавляем расход на ребенка
        this.addExpense({
            name: `Расходы на ${child.name}`,
            value: child.expense,
            type: 'child',
            childId: newChild.id
        });
        
        this._notifyListeners('childChanged', {
            operation: 'add',
            child: newChild
        });
        
        if (this._autoSave) this.save();
        return newChild;
    }

    removeChild(childId) {
        const index = this._data.children.findIndex(child => child.id === childId);
        if (index !== -1) {
            const removedChild = this._data.children.splice(index, 1)[0];
            
            // Удаляем связанный расход
            const expenseIndex = this._data.expense.findIndex(exp => 
                exp.type === 'child' && exp.childId === childId
            );
            if (expenseIndex !== -1) {
                this._data.expense.splice(expenseIndex, 1);
            }
            
            this._notifyListeners('childChanged', {
                operation: 'remove',
                child: removedChild
            });
            
            if (this._autoSave) this.save();
            return removedChild;
        }
        return null;
    }

    // === МЕТОДЫ ДЛЯ РАБОТЫ С РАБОТОЙ ===
    
    setJob(job) {
        const oldJob = { ...this._data.job };
        this._data.job = {
            title: job.title || '',
            salary: Number(job.salary) || 0
        };
        
        // Обновляем или добавляем доход от работы
        const jobIncomeIndex = this._data.income.findIndex(inc => inc.type === 'job');
        if (jobIncomeIndex !== -1) {
            this._data.income[jobIncomeIndex].value = this._data.job.salary;
            this._data.income[jobIncomeIndex].name = this._data.job.title;
        } else {
            this.addIncome({
                name: this._data.job.title,
                value: this._data.job.salary,
                type: 'job'
            });
        }
        
        this._notifyListeners('jobChanged', {
            oldJob,
            newJob: this._data.job
        });
        
        if (this._autoSave) this.save();
    }

    quitJob() {
        const oldJob = { ...this._data.job };
        this._data.job = { title: '', salary: 0 };
        
        // Удаляем доход от работы
        const jobIncomeIndex = this._data.income.findIndex(inc => inc.type === 'job');
        if (jobIncomeIndex !== -1) {
            this._data.income.splice(jobIncomeIndex, 1);
        }
        
        this._notifyListeners('jobChanged', {
            oldJob,
            newJob: this._data.job
        });
        
        if (this._autoSave) this.save();
    }

    // === МЕТОДЫ ДЛЯ РАБОТЫ С ИСТОРИЕЙ ===
    
    addHistory(entry) {
        const historyEntry = {
            id: this._generateId(),
            ...entry,
            timestamp: new Date().toISOString()
        };
        
        this._data.history.push(historyEntry);
        
        // Ограничиваем историю последними 100 записями
        if (this._data.history.length > 100) {
            this._data.history = this._data.history.slice(-100);
        }
        
        this._notifyListeners('historyChanged', {
            operation: 'add',
            entry: historyEntry
        });
        
        if (this._autoSave) this.save();
        return historyEntry;
    }

    // === МЕТОДЫ ДЛЯ РАБОТЫ С МЕСЯЦАМИ ===
    
    incrementMonths() {
        this._data.monthsCount++;
        this._notifyListeners('monthsChanged', {
            monthsCount: this._data.monthsCount
        });
        
        if (this._autoSave) this.save();
    }

    // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===
    
    /**
     * Генерация уникального ID
     */
    _generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Уведомление слушателей событий
     */
    _notifyListeners(event, data) {
        if (this._listeners.has(event)) {
            this._listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Добавить слушателя события
     */
    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        this._listeners.get(event).push(callback);
    }

    /**
     * Удалить слушателя события
     */
    off(event, callback) {
        if (this._listeners.has(event)) {
            const listeners = this._listeners.get(event);
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    // === МЕТОДЫ ДЛЯ РАСЧЕТОВ ===
    
    /**
     * Рассчитать общий доход
     */
    calculateTotalIncome() {
        return this._data.income.reduce((total, inc) => total + (Number(inc.value) || 0), 0);
    }

    /**
     * Рассчитать общий расход
     */
    calculateTotalExpense() {
        return this._data.expense.reduce((total, exp) => total + (Number(exp.value) || 0), 0);
    }

    /**
     * Рассчитать пассивный доход
     */
    calculatePassiveIncome() {
        return this._data.income
            .filter(inc => inc.type !== 'job')
            .reduce((total, inc) => total + (Number(inc.value) || 0), 0);
    }

    /**
     * Рассчитать поток наличности
     */
    calculateCashflow() {
        return this.calculateTotalIncome() - this.calculateTotalExpense();
    }

    /**
     * Рассчитать общую стоимость активов
     */
    calculateTotalAssets() {
        return this._data.asset.reduce((total, asset) => {
            let value = 0;
            if (asset.type === 'stocks') {
                value = (asset.quantity || 0) * (asset.price || 0);
            } else {
                value = Number(asset.value) || 0;
            }
            return total + value;
        }, 0);
    }

    /**
     * Рассчитать общую сумму пассивов
     */
    calculateTotalLiabilities() {
        return this._data.liability.reduce((total, liab) => total + (Number(liab.value) || 0), 0);
    }

    // === МЕТОДЫ ДЛЯ СОХРАНЕНИЯ/ЗАГРУЗКИ ===
    
    /**
     * Сохранить состояние в localStorage
     */
    save() {
        try {
            localStorage.setItem('gameState', JSON.stringify({
                cash: this._cash,
                data: this._data
            }));
        } catch (error) {
            console.error('Ошибка при сохранении состояния:', error);
        }
    }

    /**
     * Загрузить состояние из localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem('gameState');
            if (saved) {
                const state = JSON.parse(saved);
                this._cash = Number(state.cash) || 0;
                this._data = {
                    income: state.data?.income || [],
                    expense: state.data?.expense || [],
                    asset: state.data?.asset || [],
                    liability: state.data?.liability || [],
                    children: state.data?.children || [],
                    history: state.data?.history || [],
                    monthsCount: state.data?.monthsCount || 0,
                    job: state.data?.job || { title: '', salary: 0 }
                };
                
                // Уведомляем о загрузке
                this._notifyListeners('stateLoaded', {
                    cash: this._cash,
                    data: this._data
                });
            }
        } catch (error) {
            console.error('Ошибка при загрузке состояния:', error);
        }
    }

    /**
     * Сбросить игру
     */
    reset() {
        this._cash = 0;
        this._data = {
            income: [],
            expense: [],
            asset: [],
            liability: [],
            children: [],
            history: [],
            monthsCount: 0,
            job: { title: '', salary: 0 }
        };
        
        // Очищаем localStorage
        localStorage.removeItem('gameState');
        localStorage.removeItem('appData');
        localStorage.removeItem('cash');
        
        this._notifyListeners('gameReset', {});
    }

    /**
     * Включить/выключить автосохранение
     */
    setAutoSave(enabled) {
        this._autoSave = enabled;
    }
}

// Создаем глобальный экземпляр GameState
window.gameState = new GameState();
