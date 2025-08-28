/**
 * AnimationManager - управление анимациями и переходами
 * Обеспечивает плавные переходы и интерактивные эффекты
 */
class AnimationManager {
    constructor() {
        this._initialized = false;
        this._animations = new Map();
        this._isAnimating = false;
        
        // CSS классы для анимаций
        this.animationClasses = {
            fadeIn: 'animate-fade-in',
            fadeOut: 'animate-fade-out',
            slideIn: 'animate-slide-in',
            slideOut: 'animate-slide-out',
            scaleIn: 'animate-scale-in',
            scaleOut: 'animate-scale-out',
            bounce: 'animate-bounce',
            shake: 'animate-shake',
            pulse: 'animate-pulse'
        };
    }

    /**
     * Инициализация AnimationManager
     */
    init() {
        if (this._initialized) return;
        
        // Добавляем CSS стили для анимаций
        this._injectAnimationStyles();
        
        // Инициализируем обработчики событий
        this._initEventHandlers();
        
        this._initialized = true;
        console.log('✅ AnimationManager инициализирован');
    }

    /**
     * Внедрение CSS стилей для анимаций
     */
    _injectAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Базовые анимации */
            .animate-fade-in {
                animation: fadeIn 0.3s ease-in-out;
            }
            
            .animate-fade-out {
                animation: fadeOut 0.3s ease-in-out;
            }
            
            .animate-slide-in {
                animation: slideIn 0.3s ease-out;
            }
            
            .animate-slide-out {
                animation: slideOut 0.3s ease-in;
            }
            
            .animate-scale-in {
                animation: scaleIn 0.2s ease-out;
            }
            
            .animate-scale-out {
                animation: scaleOut 0.2s ease-in;
            }
            
            .animate-bounce {
                animation: bounce 0.6s ease-in-out;
            }
            
            .animate-shake {
                animation: shake 0.5s ease-in-out;
            }
            
            .animate-pulse {
                animation: pulse 1s ease-in-out infinite;
            }
            
            /* Keyframes */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes slideIn {
                from { 
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to { 
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from { 
                    transform: translateX(0);
                    opacity: 1;
                }
                to { 
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes scaleIn {
                from { 
                    transform: scale(0.8);
                    opacity: 0;
                }
                to { 
                    transform: scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes scaleOut {
                from { 
                    transform: scale(1);
                    opacity: 1;
                }
                to { 
                    transform: scale(0.8);
                    opacity: 0;
                }
            }
            
            @keyframes bounce {
                0%, 20%, 53%, 80%, 100% {
                    transform: translate3d(0,0,0);
                }
                40%, 43% {
                    transform: translate3d(0, -8px, 0);
                }
                70% {
                    transform: translate3d(0, -4px, 0);
                }
                90% {
                    transform: translate3d(0, -2px, 0);
                }
            }
            
            @keyframes shake {
                0%, 100% {
                    transform: translateX(0);
                }
                10%, 30%, 50%, 70%, 90% {
                    transform: translateX(-2px);
                }
                20%, 40%, 60%, 80% {
                    transform: translateX(2px);
                }
            }
            
            @keyframes pulse {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.05);
                }
                100% {
                    transform: scale(1);
                }
            }
            
            /* Модальные окна */
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
                z-index: 999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .modal-backdrop.show {
                opacity: 1;
            }
            
            .modal-content {
                transform: scale(0.8);
                opacity: 0;
                transition: all 0.3s ease;
            }
            
            .modal-content.show {
                transform: scale(1);
                opacity: 1;
            }
            
            /* Уведомления */
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success {
                background: linear-gradient(135deg, #4CAF50, #45a049);
            }
            
            .notification.error {
                background: linear-gradient(135deg, #f44336, #d32f2f);
            }
            
            .notification.warning {
                background: linear-gradient(135deg, #ff9800, #f57c00);
            }
            
            .notification.info {
                background: linear-gradient(135deg, #2196F3, #1976D2);
            }
            
            /* Интерактивные элементы */
            .interactive {
                transition: all 0.2s ease;
                cursor: pointer;
            }
            
            .interactive:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .interactive:active {
                transform: translateY(0);
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            }
            
            /* Кнопки */
            .btn-animated {
                position: relative;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .btn-animated::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: width 0.3s ease, height 0.3s ease;
            }
            
            .btn-animated:active::before {
                width: 200px;
                height: 200px;
            }
            
            /* Загрузка */
            .loading {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Инициализация обработчиков событий
     */
    _initEventHandlers() {
        // Добавляем классы для интерактивных элементов
        document.addEventListener('DOMContentLoaded', () => {
            this._addInteractiveClasses();
        });
    }

    /**
     * Добавить классы для интерактивных элементов
     */
    _addInteractiveClasses() {
        // Кнопки
        const buttons = document.querySelectorAll('button, .btn');
        buttons.forEach(btn => {
            btn.classList.add('interactive', 'btn-animated');
        });
        
        // Карточки
        const cards = document.querySelectorAll('.card, .category-card, .action-card');
        cards.forEach(card => {
            card.classList.add('interactive');
        });
        
        // Навигация
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.add('interactive');
        });
    }

    // === МЕТОДЫ ДЛЯ АНИМАЦИЙ ===

    /**
     * Плавное переключение экранов
     */
    animateScreenTransition(fromScreen, toScreen, direction = 'right') {
        if (!fromScreen || !toScreen) return;
        
        this._isAnimating = true;
        
        // Показываем целевой экран
        toScreen.style.display = 'block';
        toScreen.classList.add('animate-slide-in');
        
        // Скрываем исходный экран
        fromScreen.classList.add('animate-slide-out');
        
        // Убираем анимации после завершения
        setTimeout(() => {
            fromScreen.style.display = 'none';
            fromScreen.classList.remove('animate-slide-out');
            toScreen.classList.remove('animate-slide-in');
            this._isAnimating = false;
        }, 300);
    }

    /**
     * Анимация появления элемента
     */
    fadeIn(element, duration = 300) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Анимация исчезновения элемента
     */
    fadeOut(element, duration = 300) {
        if (!element) return;
        
        let start = null;
        const initialOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(initialOpacity - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Анимация масштабирования
     */
    scaleIn(element, duration = 200) {
        if (!element) return;
        
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0';
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.transition = `all ${duration}ms ease-out`;
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        }, 10);
    }

    /**
     * Анимация масштабирования (исчезновение)
     */
    scaleOut(element, duration = 200) {
        if (!element) return;
        
        element.style.transition = `all ${duration}ms ease-in`;
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }

    /**
     * Анимация тряски (для ошибок)
     */
    shake(element) {
        if (!element) return;
        
        element.classList.add('animate-shake');
        
        setTimeout(() => {
            element.classList.remove('animate-shake');
        }, 500);
    }

    /**
     * Анимация подпрыгивания (для успеха)
     */
    bounce(element) {
        if (!element) return;
        
        element.classList.add('animate-bounce');
        
        setTimeout(() => {
            element.classList.remove('animate-bounce');
        }, 600);
    }

    /**
     * Анимация пульсации
     */
    pulse(element, duration = 1000) {
        if (!element) return;
        
        element.classList.add('animate-pulse');
        
        setTimeout(() => {
            element.classList.remove('animate-pulse');
        }, duration);
    }

    // === МЕТОДЫ ДЛЯ УВЕДОМЛЕНИЙ ===

    /**
     * Показать уведомление
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Добавляем иконку
        const icon = this._getNotificationIcon(type);
        if (icon) {
            notification.innerHTML = `${icon} ${message}`;
        }
        
        document.body.appendChild(notification);
        
        // Показываем анимацию
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Скрываем через указанное время
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
        
        return notification;
    }

    /**
     * Получить иконку для уведомления
     */
    _getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        return icons[type] || '';
    }

    // === МЕТОДЫ ДЛЯ МОДАЛЬНЫХ ОКОН ===

    /**
     * Показать модальное окно с анимацией
     */
    showModal(modalElement) {
        if (!modalElement) return;
        
        // Создаем backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.id = 'modal-backdrop';
        
        document.body.appendChild(backdrop);
        
        // Показываем backdrop
        setTimeout(() => {
            backdrop.classList.add('show');
        }, 10);
        
        // Показываем модальное окно
        modalElement.style.display = 'block';
        modalElement.classList.add('show');
        
        // Обработчик закрытия по клику на backdrop
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                this.hideModal(modalElement);
            }
        });
    }

    /**
     * Скрыть модальное окно с анимацией
     */
    hideModal(modalElement) {
        if (!modalElement) return;
        
        const backdrop = document.getElementById('modal-backdrop');
        
        // Скрываем модальное окно
        modalElement.classList.remove('show');
        
        // Скрываем backdrop
        if (backdrop) {
            backdrop.classList.remove('show');
        }
        
        // Удаляем элементы после анимации
        setTimeout(() => {
            modalElement.style.display = 'none';
            if (backdrop) {
                document.body.removeChild(backdrop);
            }
        }, 300);
    }

    // === МЕТОДЫ ДЛЯ ЗАГРУЗКИ ===

    /**
     * Показать индикатор загрузки
     */
    showLoading(element, text = 'Загрузка...') {
        if (!element) return;
        
        const loading = document.createElement('div');
        loading.className = 'loading-container';
        loading.innerHTML = `
            <div class="loading"></div>
            <span style="margin-left: 10px; color: #666;">${text}</span>
        `;
        
        element.appendChild(loading);
        
        return loading;
    }

    /**
     * Скрыть индикатор загрузки
     */
    hideLoading(element) {
        if (!element) return;
        
        const loading = element.querySelector('.loading-container');
        if (loading) {
            element.removeChild(loading);
        }
    }

    // === ПУБЛИЧНЫЕ МЕТОДЫ ===

    /**
     * Проверить, идет ли анимация
     */
    isAnimating() {
        return this._isAnimating;
    }

    /**
     * Остановить все анимации
     */
    stopAllAnimations() {
        this._isAnimating = false;
        
        // Удаляем все классы анимаций
        Object.values(this.animationClasses).forEach(className => {
            const elements = document.querySelectorAll(`.${className}`);
            elements.forEach(el => el.classList.remove(className));
        });
    }
}

// Создаем глобальный экземпляр AnimationManager
window.animationManager = new AnimationManager();
