/**
 * Тестовый файл для проверки работы EventBus и UIManager
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Тестирование EventBus и UIManager ===');
    
    // Проверяем, что EventBus создан
    if (window.eventBus) {
        console.log('✅ EventBus успешно создан');
        
        // Тестируем подписку на события
        const unsubscribe = window.eventBus.on(window.AppEvents.CASH_CHANGED, function(data) {
            console.log('🔄 Получено событие CASH_CHANGED:', data);
        });
        
        // Тестируем once событие
        window.eventBus.once(window.AppEvents.INCOME_ADDED, function(data) {
            console.log('🔄 Получено событие INCOME_ADDED (once):', data);
        });
        
        // Тестируем отправку события
        window.eventBus.emit(window.AppEvents.CASH_CHANGED, {
            oldValue: 0,
            newValue: 1000
        });
        
        // Отписываемся от события
        unsubscribe();
        
    } else {
        console.log('❌ EventBus не создан');
    }
    
    // Проверяем, что UIManager создан
    if (window.uiManager) {
        console.log('✅ UIManager успешно создан');
        
        // Инициализируем UIManager
        window.uiManager.init();
        
    } else {
        console.log('❌ UIManager не создан');
    }
    
    // Проверяем, что GameState создан
    if (window.gameState) {
        console.log('✅ GameState успешно создан');
        
        // Тестируем интеграцию GameState с EventBus
        console.log('💰 Начальный баланс:', window.gameState.cash);
        
        // Добавляем деньги (должно вызвать событие)
        window.gameState.addCash(500, 'Тест EventBus');
        console.log('✅ Добавлено $500 через GameState');
        
        // Добавляем доход (должно вызвать событие)
        window.gameState.addIncome({
            name: 'Тестовый доход EventBus',
            value: 300,
            type: 'test'
        });
        console.log('✅ Добавлен доход через GameState');
        
        // Проверяем, что UI обновился
        setTimeout(() => {
            console.log('💰 Финальный баланс:', window.gameState.cash);
            console.log('📊 Общий доход:', window.gameState.calculateTotalIncome());
        }, 200);
        
    } else {
        console.log('❌ GameState не создан');
    }
    
    // Тестируем отладку EventBus
    if (window.eventBus) {
        console.log('📡 Количество событий:', window.eventBus.getEvents().length);
        console.log('📡 Слушатели CASH_CHANGED:', window.eventBus.getListenerCount(window.AppEvents.CASH_CHANGED));
    }
    
    console.log('=== Тест EventBus и UIManager завершен ===');
});
