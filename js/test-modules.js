/**
 * Тестовый файл для проверки работы новых модулей
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Тестирование новых модулей ===');
    
    // Проверяем AssetManager
    if (window.assetManager) {
        console.log('✅ AssetManager создан');
        
        // Инициализируем AssetManager
        window.assetManager.init();
        
        // Тестируем методы
        console.log('📊 Общая стоимость активов:', window.assetManager.calculateTotalAssets());
        console.log('📈 Активы типа stocks:', window.assetManager.getAssetsByType('stocks'));
        
    } else {
        console.log('❌ AssetManager не создан');
    }
    
    // Проверяем FinanceManager
    if (window.financeManager) {
        console.log('✅ FinanceManager создан');
        
        // Инициализируем FinanceManager
        window.financeManager.init();
        
        // Тестируем методы
        const formula = window.financeManager.calculateFinancialFormula();
        console.log('💰 Финансовая формула:', formula);
        
        const report = window.financeManager.getFinancialReport();
        console.log('📋 Финансовый отчет:', report);
        
        const payDayStatus = window.financeManager.getPayDayStatus();
        console.log('🎯 Статус PayDay:', payDayStatus);
        
        const loans = window.financeManager.getLoansInfo();
        console.log('🏦 Кредиты:', loans);
        
    } else {
        console.log('❌ FinanceManager не создан');
    }
    
    // Тестируем интеграцию с GameState
    if (window.gameState) {
        console.log('✅ GameState доступен для модулей');
        
        // Добавляем тестовый актив
        const testAsset = window.gameState.addAsset({
            name: 'Тестовая акция',
            type: 'stocks',
            quantity: 10,
            price: 100
        });
        console.log('📈 Добавлен тестовый актив:', testAsset);
        
        // Проверяем, что AssetManager обновился
        setTimeout(() => {
            console.log('📊 Обновленная стоимость активов:', window.assetManager.calculateTotalAssets());
        }, 100);
        
    } else {
        console.log('❌ GameState недоступен');
    }
    
    // Тестируем интеграцию с EventBus
    if (window.eventBus) {
        console.log('✅ EventBus доступен для модулей');
        
        // Подписываемся на события модулей
        window.eventBus.on(window.AppEvents.ASSET_ADDED, function(data) {
            console.log('🔄 Событие ASSET_ADDED:', data);
        });
        
        window.eventBus.on(window.AppEvents.PAYDAY_TRIGGERED, function(data) {
            console.log('🔄 Событие PAYDAY_TRIGGERED:', data);
        });
        
    } else {
        console.log('❌ EventBus недоступен');
    }
    
    console.log('=== Тест модулей завершен ===');
});
