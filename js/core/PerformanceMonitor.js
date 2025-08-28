/**
 * PerformanceMonitor - мониторинг производительности приложения
 * Показывает метрики производительности в реальном времени
 */
class PerformanceMonitor {
    constructor() {
        this._initialized = false;
        this._metrics = {
            fps: 0,
            domOperations: 0,
            renderTime: 0,
            memoryUsage: 0,
            eventCount: 0,
            lastUpdate: Date.now()
        };
        
        this._fpsCounter = 0;
        this._fpsLastTime = Date.now();
        this._domOperationsCount = 0;
        this._renderStartTime = 0;
        
        // Привязываем методы к контексту
        this._updateFPS = this._updateFPS.bind(this);
        this._updateMetrics = this._updateMetrics.bind(this);
    }

    /**
     * Инициализация PerformanceMonitor
     */
    init() {
        if (this._initialized) return;
        
        // Создаем UI для отображения метрик
        this._createPerformanceUI();
        
        // Запускаем мониторинг
        this._startMonitoring();
        
        // Подписываемся на события для отслеживания
        this._subscribeToEvents();
        
        this._initialized = true;
        console.log('✅ PerformanceMonitor инициализирован');
    }

    /**
     * Создание UI для отображения метрик
     */
    _createPerformanceUI() {
        // Создаем контейнер для метрик
        const container = document.createElement('div');
        container.id = 'performance-monitor';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            min-width: 200px;
            display: none;
        `;
        
        container.innerHTML = `
            <div style="margin-bottom: 5px; font-weight: bold;">📊 Производительность</div>
            <div>FPS: <span id="fps-value">0</span></div>
            <div>DOM операций: <span id="dom-ops">0</span></div>
            <div>Время рендера: <span id="render-time">0</span>ms</div>
            <div>Память: <span id="memory-usage">0</span>MB</div>
            <div>События/сек: <span id="event-count">0</span></div>
            <div style="margin-top: 5px; font-size: 10px; opacity: 0.7;">
                Нажмите F12 для показа/скрытия
            </div>
        `;
        
        document.body.appendChild(container);
        
        // Показываем мониторинг при нажатии F12
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12') {
                container.style.display = container.style.display === 'none' ? 'block' : 'none';
            }
        });
        
        // Показываем по умолчанию в режиме разработки
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            container.style.display = 'block';
        }
    }

    /**
     * Запуск мониторинга
     */
    _startMonitoring() {
        // Мониторинг FPS
        this._updateFPS();
        
        // Обновление метрик каждые 100ms
        setInterval(this._updateMetrics, 100);
        
        // Мониторинг памяти
        if (performance.memory) {
            setInterval(() => {
                this._metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            }, 1000);
        }
    }

    /**
     * Подписка на события для отслеживания
     */
    _subscribeToEvents() {
        if (!window.eventBus) return;
        
        // Отслеживаем все события
        const originalEmit = window.eventBus.emit.bind(window.eventBus);
        window.eventBus.emit = (event, data, options) => {
            this._metrics.eventCount++;
            return originalEmit(event, data, options);
        };
        
        // Отслеживаем DOM операции через DOM-менеджер
        if (window.DOM) {
            const originalSetText = window.DOM.setText.bind(window.DOM);
            window.DOM.setText = (id, text) => {
                this._domOperationsCount++;
                return originalSetText(id, text);
            };
            
            const originalSetHTML = window.DOM.setHTML.bind(window.DOM);
            window.DOM.setHTML = (id, html) => {
                this._domOperationsCount++;
                return originalSetHTML(id, html);
            };
        }
    }

    /**
     * Обновление FPS
     */
    _updateFPS() {
        const now = Date.now();
        this._fpsCounter++;
        
        if (now - this._fpsLastTime >= 1000) {
            this._metrics.fps = this._fpsCounter;
            this._fpsCounter = 0;
            this._fpsLastTime = now;
        }
        
        requestAnimationFrame(this._updateFPS);
    }

    /**
     * Обновление метрик
     */
    _updateMetrics() {
        // Обновляем счетчики
        this._metrics.domOperations = this._domOperationsCount;
        this._domOperationsCount = 0; // Сбрасываем счетчик
        
        // Обновляем UI
        this._updatePerformanceUI();
        
        // Логируем метрики в консоль каждые 5 секунд
        if (Date.now() - this._metrics.lastUpdate > 5000) {
            this._logMetrics();
            this._metrics.lastUpdate = Date.now();
        }
    }

    /**
     * Обновление UI метрик
     */
    _updatePerformanceUI() {
        const fpsElement = document.getElementById('fps-value');
        const domOpsElement = document.getElementById('dom-ops');
        const renderTimeElement = document.getElementById('render-time');
        const memoryElement = document.getElementById('memory-usage');
        const eventElement = document.getElementById('event-count');
        
        if (fpsElement) {
            fpsElement.textContent = this._metrics.fps;
            fpsElement.style.color = this._getFPSColor(this._metrics.fps);
        }
        
        if (domOpsElement) {
            domOpsElement.textContent = this._metrics.domOperations;
        }
        
        if (renderTimeElement) {
            renderTimeElement.textContent = this._metrics.renderTime;
        }
        
        if (memoryElement) {
            memoryElement.textContent = this._metrics.memoryUsage;
        }
        
        if (eventElement) {
            eventElement.textContent = this._metrics.eventCount;
            this._metrics.eventCount = 0; // Сбрасываем счетчик
        }
    }

    /**
     * Получить цвет для FPS
     */
    _getFPSColor(fps) {
        if (fps >= 55) return '#00ff00'; // Зеленый - отлично
        if (fps >= 45) return '#ffff00'; // Желтый - хорошо
        if (fps >= 30) return '#ff8800'; // Оранжевый - удовлетворительно
        return '#ff0000'; // Красный - плохо
    }

    /**
     * Логирование метрик в консоль
     */
    _logMetrics() {
        console.log('📊 Метрики производительности:', {
            fps: this._metrics.fps,
            domOperations: this._metrics.domOperations,
            renderTime: this._metrics.renderTime + 'ms',
            memoryUsage: this._metrics.memoryUsage + 'MB',
            eventCount: this._metrics.eventCount
        });
    }

    /**
     * Начать измерение времени рендера
     */
    startRenderTimer() {
        this._renderStartTime = performance.now();
    }

    /**
     * Завершить измерение времени рендера
     */
    endRenderTimer() {
        if (this._renderStartTime > 0) {
            this._metrics.renderTime = Math.round(performance.now() - this._renderStartTime);
            this._renderStartTime = 0;
        }
    }

    /**
     * Получить текущие метрики
     */
    getMetrics() {
        return { ...this._metrics };
    }

    /**
     * Создать отчет о производительности
     */
    generatePerformanceReport() {
        return {
            timestamp: new Date().toISOString(),
            metrics: this.getMetrics(),
            recommendations: this._generateRecommendations()
        };
    }

    /**
     * Генерировать рекомендации по оптимизации
     */
    _generateRecommendations() {
        const recommendations = [];
        
        if (this._metrics.fps < 30) {
            recommendations.push('⚠️ Низкий FPS - оптимизируйте рендеринг');
        }
        
        if (this._metrics.domOperations > 100) {
            recommendations.push('⚠️ Много DOM операций - используйте batch обновления');
        }
        
        if (this._metrics.renderTime > 16) {
            recommendations.push('⚠️ Медленный рендеринг - оптимизируйте UI обновления');
        }
        
        if (this._metrics.memoryUsage > 50) {
            recommendations.push('⚠️ Высокое потребление памяти - проверьте утечки');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('✅ Производительность в норме');
        }
        
        return recommendations;
    }
}

// Создаем глобальный экземпляр PerformanceMonitor
window.performanceMonitor = new PerformanceMonitor();
