/**
 * FinanceManager - управление финансами
 * Отвечает за PayDay, расчеты, кредиты и финансовые операции
 */
class FinanceManager {
    constructor() {
        this._initialized = false;
        this._paydayInProgress = false;
        
        // Привязываем методы к контексту
        this._handleCashChanged = this._handleCashChanged.bind(this);
        this._handleIncomeChanged = this._handleIncomeChanged.bind(this);
        this._handleExpenseChanged = this._handleExpenseChanged.bind(this);
    }

    /**
     * Инициализация FinanceManager
     */
    init() {
        if (this._initialized) return;
        
        // Подписываемся на события
        this._subscribeToEvents();
        
        // Инициализируем обработчики событий
        this._initEventHandlers();
        
        this._initialized = true;
        console.log('✅ FinanceManager инициализирован');
    }

    /**
     * Подписка на события
     */
    _subscribeToEvents() {
        const { eventBus, AppEvents } = window;
        
        eventBus.on(AppEvents.CASH_CHANGED, this._handleCashChanged);
        eventBus.on(AppEvents.INCOME_CHANGED, this._handleIncomeChanged);
        eventBus.on(AppEvents.EXPENSE_CHANGED, this._handleExpenseChanged);
    }

    /**
     * Инициализация обработчиков событий
     */
    _initEventHandlers() {
        // Обработчик кнопки PayDay
        if (window.DOM) {
            window.DOM.addEventListener('payday-btn', 'click', () => this.triggerPayDay());
        }
    }

    // === МЕТОДЫ ДЛЯ PAYDAY ===

    /**
     * Запустить PayDay
     */
    triggerPayDay() {
        if (this._paydayInProgress || !window.gameState) return;
        
        this._paydayInProgress = true;
        
        // Отправляем событие начала PayDay
        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.PAYDAY_TRIGGERED, {
                timestamp: new Date().toISOString()
            });
        }
        
        try {
            // Получаем текущие данные
            const state = window.gameState;
            const salary = state.data.job.salary || 0;
            const passiveIncome = state.calculatePassiveIncome();
            const totalExpenses = state.calculateTotalExpense();
            
            // Рассчитываем общий доход
            const totalIncome = salary + passiveIncome;
            
            // Добавляем зарплату
            if (salary > 0) {
                state.addCash(salary, `Зарплата: ${state.data.job.title}`);
            }
            
            // Добавляем пассивный доход
            if (passiveIncome > 0) {
                state.addCash(passiveIncome, 'Пассивный доход');
            }
            
            // Рассчитываем дивиденды от акций
            const dividends = this._calculateDividends();
            if (dividends > 0) {
                state.addCash(dividends, 'Дивиденды от акций');
            }
            
            // Увеличиваем счетчик месяцев
            state.incrementMonths();
            
            // Отправляем событие завершения PayDay
            if (window.eventBus) {
                window.eventBus.emit(window.AppEvents.PAYDAY_COMPLETED, {
                    salary: salary,
                    passiveIncome: passiveIncome,
                    dividends: dividends,
                    totalIncome: totalIncome,
                    totalExpenses: totalExpenses,
                    cashflow: totalIncome - totalExpenses,
                    timestamp: new Date().toISOString()
                });
            }
            
            console.log('✅ PayDay завершен успешно');
            
        } catch (error) {
            console.error('❌ Ошибка при выполнении PayDay:', error);
            
            // Отправляем событие ошибки
            if (window.eventBus) {
                window.eventBus.emit(window.AppEvents.ERROR_OCCURRED, {
                    error: error.message,
                    context: 'PayDay',
                    timestamp: new Date().toISOString()
                });
            }
        } finally {
            this._paydayInProgress = false;
        }
    }

    /**
     * Рассчитать дивиденды от акций
     */
    _calculateDividends() {
        if (!window.gameState) return 0;
        
        const assets = window.gameState.data.asset;
        let totalDividends = 0;
        
        assets.forEach(asset => {
            if (asset.type === 'stocks') {
                const dividends = this._calculateStockDividends(asset.name, asset.quantity);
                totalDividends += dividends;
            }
        });
        
        return totalDividends;
    }

    /**
     * Рассчитать дивиденды для конкретной акции
     */
    _calculateStockDividends(stockName, quantity) {
        const dividendRates = {
            '2BIGPOWER': 100,
            'CD': 50
        };
        
        return (dividendRates[stockName] || 0) * quantity;
    }

    // === МЕТОДЫ ДЛЯ КРЕДИТОВ ===

    /**
     * Взять кредит
     */
    takeLoan(amount, description) {
        if (!window.gameState) return false;
        
        const loanAmount = Number(amount) || 0;
        if (loanAmount <= 0) {
            alert('Введите корректную сумму кредита');
            return false;
        }
        
        // Добавляем деньги
        window.gameState.addCash(loanAmount, `Кредит: ${description}`);
        
        // Добавляем пассив
        window.gameState.addLiability({
            name: `Кредит: ${description}`,
            value: loanAmount,
            type: 'loan',
            description: description
        });
        
        // Добавляем расход на обслуживание кредита (10% от суммы)
        const monthlyPayment = Math.round(loanAmount * 0.1);
        window.gameState.addExpense({
            name: `Обслуживание кредита: ${description}`,
            value: monthlyPayment,
            type: 'loan',
            loanAmount: loanAmount
        });
        
        return true;
    }

    /**
     * Погасить кредит
     */
    payOffLoan(liabilityId) {
        if (!window.gameState) return false;
        
        const liability = window.gameState.data.liability.find(l => l.id === liabilityId);
        if (!liability || liability.type !== 'loan') {
            return false;
        }
        
        const amount = Number(liability.value) || 0;
        
        // Проверяем, достаточно ли денег
        if (window.gameState.cash < amount) {
            alert('Недостаточно средств для погашения кредита');
            return false;
        }
        
        // Убираем деньги
        window.gameState.removeCash(amount, `Погашение кредита: ${liability.name}`);
        
        // Удаляем пассив
        window.gameState.removeLiability(liabilityId);
        
        // Удаляем связанный расход
        const expenseIndex = window.gameState.data.expense.findIndex(exp => 
            exp.type === 'loan' && exp.loanAmount === amount
        );
        if (expenseIndex !== -1) {
            window.gameState.data.expense.splice(expenseIndex, 1);
        }
        
        return true;
    }

    // === МЕТОДЫ ДЛЯ РАСЧЕТОВ ===

    /**
     * Рассчитать финансовую формулу
     */
    calculateFinancialFormula() {
        if (!window.gameState) return null;
        
        const state = window.gameState;
        
        return {
            salary: state.data.job.salary || 0,
            passiveIncome: state.calculatePassiveIncome(),
            totalIncome: state.calculateTotalIncome(),
            totalExpenses: state.calculateTotalExpense(),
            cashflow: state.calculateCashflow(),
            totalAssets: state.calculateTotalAssets(),
            totalLiabilities: state.calculateTotalLiabilities(),
            netWorth: state.calculateTotalAssets() - state.calculateTotalLiabilities()
        };
    }

    /**
     * Рассчитать коэффициент финансовой свободы
     */
    calculateFinancialFreedomRatio() {
        if (!window.gameState) return 0;
        
        const state = window.gameState;
        const passiveIncome = state.calculatePassiveIncome();
        const totalExpenses = state.calculateTotalExpense();
        
        if (totalExpenses === 0) return 0;
        
        return (passiveIncome / totalExpenses) * 100;
    }

    /**
     * Рассчитать коэффициент задолженности
     */
    calculateDebtRatio() {
        if (!window.gameState) return 0;
        
        const state = window.gameState;
        const totalLiabilities = state.calculateTotalLiabilities();
        const totalAssets = state.calculateTotalAssets();
        
        if (totalAssets === 0) return 0;
        
        return (totalLiabilities / totalAssets) * 100;
    }

    // === МЕТОДЫ ДЛЯ АНАЛИЗА ===

    /**
     * Получить финансовый отчет
     */
    getFinancialReport() {
        if (!window.gameState) return null;
        
        const state = window.gameState;
        const formula = this.calculateFinancialFormula();
        
        return {
            summary: formula,
            analysis: {
                financialFreedomRatio: this.calculateFinancialFreedomRatio(),
                debtRatio: this.calculateDebtRatio(),
                monthsPlayed: state.data.monthsCount,
                totalTransactions: state.data.history.length
            },
            recommendations: this._generateRecommendations(formula)
        };
    }

    /**
     * Генерировать рекомендации
     */
    _generateRecommendations(formula) {
        const recommendations = [];
        
        if (formula.cashflow < 0) {
            recommendations.push('Увеличьте доходы или сократите расходы для положительного cashflow');
        }
        
        if (formula.passiveIncome < formula.totalExpenses * 0.5) {
            recommendations.push('Развивайте пассивный доход для достижения финансовой свободы');
        }
        
        if (formula.totalLiabilities > formula.totalAssets * 0.5) {
            recommendations.push('Сократите долги для улучшения финансового состояния');
        }
        
        if (formula.netWorth < 0) {
            recommendations.push('Сосредоточьтесь на увеличении активов и сокращении пассивов');
        }
        
        return recommendations;
    }

    // === ОБРАБОТЧИКИ СОБЫТИЙ ===

    _handleCashChanged(data) {
        // Можно добавить логику для отслеживания изменений денег
    }

    _handleIncomeChanged(data) {
        // Можно добавить логику для отслеживания изменений доходов
    }

    _handleExpenseChanged(data) {
        // Можно добавить логику для отслеживания изменений расходов
    }

    // === ПУБЛИЧНЫЕ МЕТОДЫ ===

    /**
     * Проверить, идет ли PayDay
     */
    isPayDayInProgress() {
        return this._paydayInProgress;
    }

    /**
     * Получить статус PayDay
     */
    getPayDayStatus() {
        return {
            inProgress: this._paydayInProgress,
            canTrigger: !this._paydayInProgress && window.gameState !== null
        };
    }

    /**
     * Получить информацию о кредитах
     */
    getLoansInfo() {
        if (!window.gameState) return [];
        
        return window.gameState.data.liability.filter(l => l.type === 'loan');
    }

    /**
     * Получить общую сумму кредитов
     */
    getTotalLoans() {
        const loans = this.getLoansInfo();
        return loans.reduce((total, loan) => total + (Number(loan.value) || 0), 0);
    }
}

// Создаем глобальный экземпляр FinanceManager
window.financeManager = new FinanceManager();
