/**
 * Тестовый файл для проверки работы DOM-менеджера
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Тестирование DOM-менеджера ===');
    
    // Проверяем, что DOM-менеджер создан
    if (window.DOM) {
        console.log('✅ DOM-менеджер успешно создан');
        
        // Тестируем получение элементов
        const cashElement = window.DOM.get('top-cash-amount');
        if (cashElement) {
            console.log('✅ Элемент top-cash-amount найден:', cashElement);
        } else {
            console.log('❌ Элемент top-cash-amount не найден');
        }
        
        // Тестируем установку текста
        window.DOM.setText('top-cash-amount', '9999');
        console.log('✅ Установлен текст для top-cash-amount');
        
        // Тестируем получение значения
        const currentCash = window.DOM.get('top-cash-amount').textContent;
        console.log('✅ Текущее значение cash:', currentCash);
        
        // Тестируем переключение видимости
        window.DOM.toggle('new-game-btn', false);
        console.log('✅ Скрыта кнопка new-game-btn');
        
        setTimeout(() => {
            window.DOM.toggle('new-game-btn', true);
            console.log('✅ Показана кнопка new-game-btn');
        }, 1000);
        
    } else {
        console.log('❌ DOM-менеджер не создан');
    }
    
    console.log('=== Тест завершен ===');
});
