/**
 * Тестовый файл для демонстрации оптимизаций производительности
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Тестирование оптимизаций производительности ===');
    
    // Инициализируем PerformanceMonitor
    if (window.performanceMonitor) {
        window.performanceMonitor.init();
        console.log('✅ PerformanceMonitor инициализирован');
    }
    
    // Инициализируем PerformanceUtils
    if (window.performanceUtils) {
        console.log('✅ PerformanceUtils доступен');
        
        // Запускаем мониторинг утечек памяти
        window.performanceUtils.startMemoryLeakDetection();
        
        // Тестируем дебаунсинг
        const debouncedFunction = window.performanceUtils.debounce(() => {
            console.log('🔄 Дебаунсированная функция выполнена');
        }, 500, 'test-debounce');
        
        // Вызываем функцию несколько раз быстро
        for (let i = 0; i < 10; i++) {
            debouncedFunction();
        }
        
        // Тестируем throttling
        const throttledFunction = window.performanceUtils.throttle(() => {
            console.log('🔄 Throttled функция выполнена');
        }, 1000, 'test-throttle');
        
        // Вызываем функцию несколько раз
        for (let i = 0; i < 5; i++) {
            setTimeout(() => throttledFunction(), i * 200);
        }
        
        // Тестируем batch операции
        window.performanceUtils.addToBatch('test-batch', () => {
            console.log('🔄 Batch операция 1 выполнена');
        }, 1000);
        
        window.performanceUtils.addToBatch('test-batch', () => {
            console.log('🔄 Batch операция 2 выполнена');
        }, 1000);
        
        // Тестируем измерение времени выполнения
        window.performanceUtils.measureExecutionTime(() => {
            // Имитируем тяжелую операцию
            let result = 0;
            for (let i = 0; i < 1000000; i++) {
                result += Math.random();
            }
            return result;
        }, 'Тяжелая операция');
        
        // Тестируем batch DOM обновления
        if (window.DOM) {
            const domUpdates = [
                { id: 'top-cash-amount', type: 'text', value: '9999' },
                { id: 'salary-value', type: 'text', value: '5000' },
                { id: 'passive-value', type: 'text', value: '1000' }
            ];
            
            window.performanceUtils.batchDOMUpdates(domUpdates);
            console.log('🔄 Batch DOM обновления выполнены');
        }
        
    } else {
        console.log('❌ PerformanceUtils недоступен');
    }
    
    // Тестируем интеграцию с UIManager
    if (window.uiManager) {
        console.log('✅ UIManager доступен для оптимизации');
        
        // Добавляем несколько обновлений в очередь рендеринга
        for (let i = 0; i < 5; i++) {
            window.performanceUtils.addToRenderQueue(() => {
                console.log(`🔄 Операция рендеринга ${i + 1} выполнена`);
            }, i % 3); // Разные приоритеты
        }
        
    } else {
        console.log('❌ UIManager недоступен');
    }
    
    // Тестируем виртуализацию списка
    if (window.performanceUtils) {
        const testData = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Элемент ${i}`,
            value: Math.random() * 1000
        }));
        
        const renderItem = (item, index) => {
            const div = document.createElement('div');
            div.textContent = `${item.name}: $${item.value.toFixed(2)}`;
            div.style.padding = '10px';
            div.style.borderBottom = '1px solid #ccc';
            return div;
        };
        
        const virtualList = window.performanceUtils.createVirtualList(
            testData, 
            renderItem, 
            40, // высота элемента
            10  // количество видимых элементов
        );
        
        // Добавляем виртуальный список на страницу (скрыто)
        virtualList.style.position = 'absolute';
        virtualList.style.left = '-9999px';
        document.body.appendChild(virtualList);
        
        console.log('🔄 Виртуальный список создан с 1000 элементами');
    }
    
    // Создаем кнопку для тестирования производительности
    const testButton = document.createElement('button');
    testButton.textContent = '🧪 Тест производительности';
    testButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        padding: 10px 15px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 10000;
    `;
    
    testButton.addEventListener('click', () => {
        console.log('🧪 Запуск теста производительности...');
        
        // Тестируем множественные обновления
        if (window.gameState && window.performanceUtils) {
            const startTime = performance.now();
            
            // Добавляем много данных быстро
            for (let i = 0; i < 100; i++) {
                window.gameState.addIncome({
                    name: `Тестовый доход ${i}`,
                    value: Math.random() * 1000,
                    type: 'test'
                });
            }
            
            const endTime = performance.now();
            console.log(`⏱️ Добавление 100 доходов заняло ${(endTime - startTime).toFixed(2)}ms`);
            
            // Генерируем отчет о производительности
            if (window.performanceMonitor) {
                const report = window.performanceMonitor.generatePerformanceReport();
                console.log('📊 Отчет о производительности:', report);
            }
        }
    });
    
    document.body.appendChild(testButton);
    
    // Создаем кнопку для очистки памяти
    const cleanupButton = document.createElement('button');
    cleanupButton.textContent = '🧹 Очистить память';
    cleanupButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 200px;
        padding: 10px 15px;
        background: #ff9800;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        z-index: 10000;
    `;
    
    cleanupButton.addEventListener('click', () => {
        if (window.performanceUtils) {
            window.performanceUtils.cleanupMemory();
        }
    });
    
    document.body.appendChild(cleanupButton);
    
    console.log('=== Тест производительности завершен ===');
    console.log('💡 Нажмите F12 чтобы увидеть монитор производительности');
    console.log('💡 Используйте кнопки для тестирования');
});
