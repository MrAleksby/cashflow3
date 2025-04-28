// Функция сохранения всех данных в localStorage
window.saveData = function() {
    try {
        // Сохраняем основные данные
        localStorage.setItem('appData', JSON.stringify(window.data));
        // Сохраняем текущий баланс
        localStorage.setItem('cash', window.cash);
        console.log('Данные успешно сохранены');
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
    }
};

// Функция сброса игры
window.resetGame = function() {
    if (!confirm('Вы уверены, что хотите начать новую игру? Все текущие данные будут удалены!')) {
        return;
    }
    
    // Очищаем все данные
    window.data = {
        income: [],
        expense: [],
        asset: [],
        liability: [],
        children: [],
        history: []
    };
    window.cash = 0;
    
    // Очищаем localStorage
    localStorage.removeItem('appData');
    localStorage.removeItem('cash');
    
    // Обновляем отображение
    if (typeof window.renderAll === 'function') window.renderAll();
    if (typeof window.renderIncome === 'function') window.renderIncome();
    if (typeof window.renderExpense === 'function') window.renderExpense();
    if (typeof window.renderCash === 'function') window.renderCash();
    if (typeof window.renderSummary === 'function') window.renderSummary();
    
    alert('Игра успешно сброшена. Можете начинать заново!');
};

// Функция загрузки данных из localStorage
window.loadData = function() {
    try {
        // Загружаем основные данные
        const savedData = localStorage.getItem('appData');
        if (savedData) {
            window.data = JSON.parse(savedData);
            
            // Проверяем и инициализируем все необходимые массивы
            if (!Array.isArray(window.data.income)) window.data.income = [];
            if (!Array.isArray(window.data.expense)) window.data.expense = [];
            if (!Array.isArray(window.data.asset)) window.data.asset = [];
            if (!Array.isArray(window.data.liability)) window.data.liability = [];
            if (!Array.isArray(window.data.children)) window.data.children = [];
            if (!Array.isArray(window.data.history)) window.data.history = [];
        } else {
            // Инициализируем пустые данные если ничего не сохранено
            window.data = {
                income: [],
                expense: [],
                asset: [],
                liability: [],
                children: [],
                history: []
            };
        }

        // Загружаем баланс
        const savedCash = localStorage.getItem('cash');
        window.cash = savedCash ? parseFloat(savedCash) : 0;

        // Обновляем все отображения
        setTimeout(() => {
            if (typeof window.renderAll === 'function') window.renderAll();
            if (typeof window.renderIncome === 'function') window.renderIncome();
            if (typeof window.renderExpense === 'function') window.renderExpense();
            if (typeof window.renderCash === 'function') window.renderCash();
            if (typeof window.renderSummary === 'function') window.renderSummary();
            console.log('Отображение обновлено');
        }, 100);
        
        console.log('Данные успешно загружены');
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        // В случае ошибки инициализируем пустые данные
        window.data = {
            income: [],
            expense: [],
            asset: [],
            liability: [],
            children: [],
            history: []
        };
        window.cash = 0;
    }
};

// Автоматическое сохранение данных при изменениях
window.autoSave = function() {
    window.saveData();
};

// Загружаем данные при запуске приложения
document.addEventListener('DOMContentLoaded', function() {
    window.loadData();
}); 