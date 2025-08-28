/**
 * Тестовый файл для проверки работы GameState
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Тестирование GameState ===');
    
    // Проверяем, что GameState создан
    if (window.gameState) {
        console.log('✅ GameState успешно создан');
        
        // Тестируем работу с деньгами
        console.log('💰 Начальный баланс:', window.gameState.cash);
        
        window.gameState.addCash(1000, 'Тестовое пополнение');
        console.log('✅ Добавлено $1000, новый баланс:', window.gameState.cash);
        
        window.gameState.removeCash(300, 'Тестовое списание');
        console.log('✅ Списано $300, новый баланс:', window.gameState.cash);
        
        // Тестируем работу с доходами
        window.gameState.addIncome({
            name: 'Тестовый доход',
            value: 500,
            type: 'test'
        });
        console.log('✅ Добавлен доход, общий доход:', window.gameState.calculateTotalIncome());
        
        // Тестируем работу с расходами
        window.gameState.addExpense({
            name: 'Тестовый расход',
            value: 200,
            type: 'test'
        });
        console.log('✅ Добавлен расход, общий расход:', window.gameState.calculateTotalExpense());
        
        // Тестируем расчет cashflow
        console.log('💸 Cashflow:', window.gameState.calculateCashflow());
        
        // Тестируем работу с детьми
        window.gameState.addChild({
            name: 'Тестовый ребенок',
            expense: 150
        });
        console.log('✅ Добавлен ребенок, детей:', window.gameState.data.children.length);
        
        // Тестируем работу с работой
        window.gameState.setJob({
            title: 'Тестовая работа',
            salary: 2000
        });
        console.log('✅ Устроен на работу:', window.gameState.data.job.title);
        
        // Тестируем события
        window.gameState.on('cashChanged', function(data) {
            console.log('🔄 Событие cashChanged:', data);
        });
        
        window.gameState.on('incomeChanged', function(data) {
            console.log('🔄 Событие incomeChanged:', data);
        });
        
        // Тестируем сохранение
        window.gameState.save();
        console.log('✅ Состояние сохранено');
        
        // Тестируем загрузку
        window.gameState.load();
        console.log('✅ Состояние загружено');
        
        // Обновляем UI через DOM-менеджер
        if (window.DOM) {
            window.DOM.setText('top-cash-amount', window.gameState.cash);
            console.log('✅ UI обновлен через DOM-менеджер');
        }
        
    } else {
        console.log('❌ GameState не создан');
    }
    
    console.log('=== Тест GameState завершен ===');
});
