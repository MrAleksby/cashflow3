/**
 * DOM Manager - централизованное управление DOM элементами
 * Кэширует все элементы и предоставляет единый интерфейс доступа
 */
class DOMManager {
    constructor() {
        this.elements = new Map();
        this.initializeElements();
    }

    /**
     * Инициализация всех необходимых DOM элементов
     */
    initializeElements() {
        // Основные элементы интерфейса
        this.cacheElement('top-cash-amount');
        this.cacheElement('new-game-btn');
        this.cacheElement('main-buy-btn');
        this.cacheElement('main-sell-btn');
        this.cacheElement('main-action-btn');
        this.cacheElement('payday-btn');

        // Экраны
        this.cacheElement('screen-cashflow');
        this.cacheElement('screen-income');
        this.cacheElement('screen-expense');
        this.cacheElement('screen-asset');
        this.cacheElement('screen-liability');
        this.cacheElement('screen-history');

        // Списки элементов
        this.cacheElement('income-list');
        this.cacheElement('expense-list');
        this.cacheElement('asset-list');
        this.cacheElement('liability-list');
        this.cacheElement('history-container');

        // Итоговые значения
        this.cacheElement('income-total');
        this.cacheElement('expense-total');
        this.cacheElement('asset-total');
        this.cacheElement('liability-total');

        // Сводка
        this.cacheElement('salary-value');
        this.cacheElement('passive-value');
        this.cacheElement('income-sum');
        this.cacheElement('expense-sum');
        this.cacheElement('cashflow');
        this.cacheElement('months-counter');

        // Модальные окна
        this.cacheElement('buy-modal');
        this.cacheElement('sell-modal');
        this.cacheElement('action-modal');

        // Элементы модального окна покупки
        this.cacheElement('modal-wallet-amount');
        this.cacheElement('stock-list');
        this.cacheElement('realestate-list');
        this.cacheElement('business-list');
        this.cacheElement('preciousmetals-list');
        this.cacheElement('misc-list');

        // Элементы модального окна продажи
        this.cacheElement('selected-stock-info');
        this.cacheElement('selected-realestate-info');
        this.cacheElement('selected-business-info');
        this.cacheElement('selected-preciousmetals-info');
        this.cacheElement('selected-misc-info');
        this.cacheElement('sell-asset-btn');
        this.cacheElement('cancel-sell-btn');

        // Элементы модального окна действий
        this.cacheElement('modal-action-wallet-amount');
        this.cacheElement('child-name');
        this.cacheElement('child-expense');
        this.cacheElement('add-child-btn');
        this.cacheElement('children-list');
        this.cacheElement('loan-amount');
        this.cacheElement('loan-description');
        this.cacheElement('take-loan-btn');
        this.cacheElement('take-money-amount');
        this.cacheElement('take-money-description');
        this.cacheElement('take-money-btn');
        this.cacheElement('give-money-amount');
        this.cacheElement('give-money-description');
        this.cacheElement('give-money-btn');
        this.cacheElement('job-salary');
        this.cacheElement('job-title');
        this.cacheElement('set-job-btn');
        this.cacheElement('quit-job-btn');
    }

    /**
     * Кэширует элемент по ID
     * @param {string} id - ID элемента
     */
    cacheElement(id) {
        const element = document.getElementById(id);
        if (element) {
            this.elements.set(id, element);
        } else {
            console.warn(`Element with id '${id}' not found`);
        }
    }

    /**
     * Получает элемент из кэша
     * @param {string} id - ID элемента
     * @returns {HTMLElement|null} - DOM элемент или null
     */
    get(id) {
        return this.elements.get(id) || null;
    }

    /**
     * Получает элемент из кэша с проверкой существования
     * @param {string} id - ID элемента
     * @returns {HTMLElement} - DOM элемент
     * @throws {Error} - если элемент не найден
     */
    getRequired(id) {
        const element = this.get(id);
        if (!element) {
            throw new Error(`Required element with id '${id}' not found`);
        }
        return element;
    }

    /**
     * Обновляет текст элемента
     * @param {string} id - ID элемента
     * @param {string|number} text - новый текст
     */
    setText(id, text) {
        const element = this.get(id);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Обновляет HTML содержимое элемента
     * @param {string} id - ID элемента
     * @param {string} html - новый HTML
     */
    setHTML(id, html) {
        const element = this.get(id);
        if (element) {
            element.innerHTML = html;
        }
    }

    /**
     * Показывает/скрывает элемент
     * @param {string} id - ID элемента
     * @param {boolean} show - показать или скрыть
     */
    toggle(id, show) {
        const element = this.get(id);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Добавляет/удаляет класс элемента
     * @param {string} id - ID элемента
     * @param {string} className - имя класса
     * @param {boolean} add - добавить или удалить
     */
    toggleClass(id, className, add) {
        const element = this.get(id);
        if (element) {
            if (add) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }
    }

    /**
     * Получает значение input элемента
     * @param {string} id - ID элемента
     * @returns {string} - значение input
     */
    getInputValue(id) {
        const element = this.get(id);
        return element ? element.value : '';
    }

    /**
     * Устанавливает значение input элемента
     * @param {string} id - ID элемента
     * @param {string} value - новое значение
     */
    setInputValue(id, value) {
        const element = this.get(id);
        if (element) {
            element.value = value;
        }
    }

    /**
     * Очищает значение input элемента
     * @param {string} id - ID элемента
     */
    clearInput(id) {
        this.setInputValue(id, '');
    }

    /**
     * Добавляет обработчик события
     * @param {string} id - ID элемента
     * @param {string} event - тип события
     * @param {Function} handler - обработчик
     */
    addEventListener(id, event, handler) {
        const element = this.get(id);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    /**
     * Удаляет обработчик события
     * @param {string} id - ID элемента
     * @param {string} event - тип события
     * @param {Function} handler - обработчик
     */
    removeEventListener(id, event, handler) {
        const element = this.get(id);
        if (element) {
            element.removeEventListener(event, handler);
        }
    }
}

// Создаем глобальный экземпляр DOM-менеджера
window.DOM = new DOMManager();
