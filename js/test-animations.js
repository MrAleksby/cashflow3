/**
 * Тестовый файл для демонстрации анимаций и улучшений UX
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Тестирование анимаций и UX ===');
    
    // Инициализируем AnimationManager
    if (window.animationManager) {
        window.animationManager.init();
        console.log('✅ AnimationManager инициализирован');
        
        // Показываем приветственное уведомление
        setTimeout(() => {
            window.animationManager.showNotification('Добро пожаловать в Cashflow!', 'success', 4000);
        }, 1000);
        
    } else {
        console.log('❌ AnimationManager недоступен');
    }
    
    // Создаем панель для тестирования анимаций
    const testPanel = document.createElement('div');
    testPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 15px;
        border-radius: 10px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        min-width: 200px;
    `;
    
    testPanel.innerHTML = `
        <div style="margin-bottom: 10px; font-weight: bold;">🎨 Тест анимаций</div>
        <button id="test-notification" style="margin: 2px; padding: 5px 8px; font-size: 10px;">Уведомление</button>
        <button id="test-bounce" style="margin: 2px; padding: 5px 8px; font-size: 10px;">Bounce</button>
        <button id="test-shake" style="margin: 2px; padding: 5px 8px; font-size: 10px;">Shake</button>
        <button id="test-pulse" style="margin: 2px; padding: 5px 8px; font-size: 10px;">Pulse</button>
        <button id="test-modal" style="margin: 2px; padding: 5px 8px; font-size: 10px;">Модальное окно</button>
    `;
    
    document.body.appendChild(testPanel);
    
    // Обработчики для кнопок тестирования
    document.getElementById('test-notification').addEventListener('click', () => {
        const types = ['success', 'error', 'warning', 'info'];
        const messages = [
            'Операция выполнена успешно!',
            'Произошла ошибка!',
            'Внимание! Проверьте данные.',
            'Информационное сообщение.'
        ];
        
        const randomIndex = Math.floor(Math.random() * types.length);
        window.animationManager.showNotification(
            messages[randomIndex], 
            types[randomIndex]
        );
    });
    
    document.getElementById('test-bounce').addEventListener('click', () => {
        const cashElement = document.getElementById('top-cash-amount');
        if (cashElement && window.animationManager) {
            window.animationManager.bounce(cashElement);
        }
    });
    
    document.getElementById('test-shake').addEventListener('click', () => {
        const cashElement = document.getElementById('top-cash-amount');
        if (cashElement && window.animationManager) {
            window.animationManager.shake(cashElement);
        }
    });
    
    document.getElementById('test-pulse').addEventListener('click', () => {
        const paydayBtn = document.getElementById('payday-btn');
        if (paydayBtn && window.animationManager) {
            window.animationManager.pulse(paydayBtn, 2000);
        }
    });
    
    document.getElementById('test-modal').addEventListener('click', () => {
        // Создаем тестовое модальное окно
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            display: none;
            max-width: 400px;
        `;
        
        modal.innerHTML = `
            <h3 style="margin-top: 0; color: #333;">Тестовое модальное окно</h3>
            <p style="color: #666;">Это демонстрация анимированного модального окна с backdrop эффектом.</p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                Закрыть
            </button>
        `;
        
        document.body.appendChild(modal);
        window.animationManager.showModal(modal);
    });
    
    // Интеграция с существующими модулями
    if (window.gameState && window.animationManager) {
        // Показываем уведомления при изменениях
        const originalAddCash = window.gameState.addCash.bind(window.gameState);
        window.gameState.addCash = function(amount, description) {
            originalAddCash(amount, description);
            window.animationManager.showNotification(
                `Добавлено $${amount}`, 
                'success', 
                2000
            );
        };
        
        const originalRemoveCash = window.gameState.removeCash.bind(window.gameState);
        window.gameState.removeCash = function(amount, description) {
            const success = originalRemoveCash(amount, description);
            if (success) {
                window.animationManager.showNotification(
                    `Списано $${amount}`, 
                    'info', 
                    2000
                );
            } else {
                window.animationManager.showNotification(
                    'Недостаточно средств!', 
                    'error', 
                    3000
                );
            }
        };
        
        const originalAddIncome = window.gameState.addIncome.bind(window.gameState);
        window.gameState.addIncome = function(income) {
            originalAddIncome(income);
            window.animationManager.showNotification(
                `Добавлен доход: ${income.name}`, 
                'success', 
                2000
            );
        };
        
        const originalAddExpense = window.gameState.addExpense.bind(window.gameState);
        window.gameState.addExpense = function(expense) {
            originalAddExpense(expense);
            window.animationManager.showNotification(
                `Добавлен расход: ${expense.name}`, 
                'warning', 
                2000
            );
        };
    }
    
    // Анимация при переключении экранов
    if (window.animationManager) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Добавляем небольшую анимацию к кнопке
                window.animationManager.bounce(item);
            });
        });
    }
    
    // Анимация при наведении на карточки
    if (window.animationManager) {
        const cards = document.querySelectorAll('.category-card, .action-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
    
    // Анимация при загрузке страницы
    if (window.animationManager) {
        setTimeout(() => {
            const elements = document.querySelectorAll('.block, .action-btn');
            elements.forEach((element, index) => {
                setTimeout(() => {
                    window.animationManager.fadeIn(element);
                }, index * 100);
            });
        }, 500);
    }
    
    console.log('=== Тест анимаций завершен ===');
    console.log('💡 Используйте панель в правом нижнем углу для тестирования');
});
