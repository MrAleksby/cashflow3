/**
 * AssetManager - управление активами
 * Отвечает за покупку, продажу и расчеты активов
 */
class AssetManager {
    constructor() {
        this._initialized = false;
        this._selectedAsset = null;
        this._currentAssetType = 'stocks';
        
        // Привязываем методы к контексту
        this._handleAssetChanged = this._handleAssetChanged.bind(this);
        this._handleCashChanged = this._handleCashChanged.bind(this);
    }

    /**
     * Инициализация AssetManager
     */
    init() {
        if (this._initialized) return;
        
        // Подписываемся на события
        this._subscribeToEvents();
        
        // Инициализируем обработчики событий
        this._initEventHandlers();
        
        this._initialized = true;
        console.log('✅ AssetManager инициализирован');
    }

    /**
     * Подписка на события
     */
    _subscribeToEvents() {
        const { eventBus, AppEvents } = window;
        
        eventBus.on(AppEvents.ASSET_CHANGED, this._handleAssetChanged);
        eventBus.on(AppEvents.CASH_CHANGED, this._handleCashChanged);
    }

    /**
     * Инициализация обработчиков событий
     */
    _initEventHandlers() {
        // Обработчики для кнопок покупки/продажи
        if (window.DOM) {
            // Добавляем обработчики для новой логики
            window.DOM.addEventListener('main-buy-btn', 'click', () => this.openBuyModal());
            window.DOM.addEventListener('main-sell-btn', 'click', () => this.openSellModal());
        } else {
            // Альтернативный способ, если DOM еще не инициализирован
            const sellBtn = document.getElementById('main-sell-btn');
            const buyBtn = document.getElementById('main-buy-btn');
            
            if (sellBtn) {
                sellBtn.addEventListener('click', () => this.openSellModal());
            }
            if (buyBtn) {
                buyBtn.addEventListener('click', () => this.openBuyModal());
            }
        }
        
        // Обработчики для кнопок типов активов в модальном окне продажи
        document.addEventListener('click', (e) => {
            if (e.target.closest('.asset-type-btn')) {
                const btn = e.target.closest('.asset-type-btn');
                const assetType = btn.dataset.type;
                console.log('🎯 Клик по кнопке типа актива:', assetType, btn);
                
                if (assetType === 'stocks') {
                    // Для акций открываем новое модальное окно со списком акций
                    this._openSellStocksListModal();
                } else {
                    // Для других типов используем старую логику
                    this._switchAssetType(assetType);
                }
            }
        });
        
        // Обработчик закрытия модального окна продажи
        document.addEventListener('click', (e) => {
            if (e.target.closest('#sell-modal .close-btn') || e.target.closest('#cancel-sell-btn')) {
                this.closeSellModal();
            }
        });
        
        // Обработчики для полей ввода в модальном окне продажи
        document.addEventListener('input', (e) => {
            if (e.target.matches('.sell-quantity, .sell-price')) {
                this._updateSellCalculations();
            } else if (e.target.matches('.sell-realestate-price')) {
                this._updateRealEstateSellCalculations();
            } else if (e.target.matches('.sell-business-price')) {
                this._updateBusinessSellCalculations();
            } else if (e.target.matches('.sell-preciousmetals-price')) {
                this._updatePreciousMetalsSellCalculations();
            } else if (e.target.matches('.sell-misc-price')) {
                this._updateMiscSellCalculations();
            }
        });
        
        // Обработчик для кнопки продажи
        document.addEventListener('click', (e) => {
            if (e.target.matches('#sell-asset-btn')) {
                this._sellAsset();
            }
        });
    }

    // === МЕТОДЫ ДЛЯ ПОКУПКИ АКТИВОВ ===

    /**
     * Открыть модальное окно покупки
     */
    openBuyModal() {
        if (!window.DOM) return;
        
        const modal = window.DOM.get('buy-modal');
        if (modal) {
            // Используем старый способ открытия для совместимости
            modal.classList.add('active');
            this._updateBuyModalWallet();
            
            // Показываем уведомление о новой логике
            if (window.animationManager) {
                window.animationManager.showNotification('🆕 AssetManager активен! Улучшенная логика покупки активов', 'info');
            }
            console.log('🎯 AssetManager: Открыто модальное окно покупки');
        }
    }

    /**
     * Закрыть модальное окно покупки
     */
    closeBuyModal() {
        if (!window.DOM) return;
        
        const modal = window.DOM.get('buy-modal');
        if (modal) {
            // Используем старый способ закрытия для совместимости
            modal.classList.remove('active');
        }
    }

    /**
     * Обновить баланс в модальном окне покупки
     */
    _updateBuyModalWallet() {
        if (!window.DOM || !window.gameState) return;
        
        const walletElement = window.DOM.get('modal-wallet-amount');
        if (walletElement) {
            walletElement.textContent = window.gameState.cash;
        }
    }

    /**
     * Инициализация обработчиков в модальном окне покупки
     */
    _initBuyModalHandlers() {
        if (!window.DOM) return;
        
        // Обработчики для категорий активов
        const categoryCards = document.querySelectorAll('#buy-modal .category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const category = card.dataset.category;
                this._showAssetCategory(category);
            });
        });

        // Обработчик закрытия
        const closeBtn = document.querySelector('#buy-modal .close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeBuyModal());
        }
    }

    /**
     * Показать активы определенной категории
     */
    _showAssetCategory(category) {
        // Здесь будет логика показа активов по категориям
        console.log('Показать категорию:', category);
    }

    // === МЕТОДЫ ДЛЯ ПРОДАЖИ АКТИВОВ ===

    /**
     * Открыть модальное окно продажи
     */
    openSellModal() {
        let modal = null;
        
        if (window.DOM) {
            modal = window.DOM.get('sell-modal');
        } else {
            modal = document.getElementById('sell-modal');
        }
        
        if (modal) {
            modal.style.display = 'block';
            this._currentAssetType = 'stocks';
            this._updateAssetTypeButtons();
            
            console.log('🎯 AssetManager: Открыто модальное окно продажи');
            console.log('📊 window.data доступен:', !!window.data);
            console.log('📊 window.data.asset:', window.data?.asset);
            console.log('📊 GameState доступен:', !!window.gameState);
            console.log('📊 Данные GameState:', window.gameState?.data);
            
            // Показываем уведомление о новой логике
            if (window.animationManager) {
                window.animationManager.showNotification('🆕 AssetManager активен! Улучшенная логика продажи активов', 'info');
            }
        } else {
            console.error('❌ Модальное окно продажи не найдено');
        }
    }

    /**
     * Открыть модальное окно списка акций для продажи
     */
    _openSellStocksListModal() {
        const modal = document.getElementById('sell-stocks-list-modal');
        if (!modal) {
            console.log('❌ Модальное окно списка акций не найдено');
            return;
        }

        // Закрываем основное модальное окно продажи
        this.closeSellModal();
        
        // Загружаем список акций
        this._loadStocksList();
        
        // Показываем новое модальное окно
        modal.style.display = 'block';
        
        console.log('🎯 Открыто модальное окно списка акций для продажи');
    }

    /**
     * Закрыть модальное окно списка акций
     */
    closeSellStocksListModal() {
        const modal = document.getElementById('sell-stocks-list-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * Вернуться к выбору типов активов
     */
    backToAssetTypes() {
        // Закрываем модальное окно списка акций
        this.closeSellStocksListModal();
        
        // Открываем основное модальное окно продажи
        this.openSellModal();
    }

    /**
     * Загрузить список акций для продажи
     */
    _loadStocksList() {
        const listElement = document.getElementById('sell-stocks-list');
        if (!listElement) {
            console.log('❌ Элемент списка акций не найден');
            return;
        }

        // Получаем данные об акциях
        let assets = [];
        if (window.data && window.data.asset) {
            assets = window.data.asset || [];
        } else if (window.gameState && window.gameState.data) {
            assets = window.gameState.data.asset || [];
        }

        // Фильтруем только акции
        const stocks = assets.filter(asset => 
            asset.type === 'stocks' || 
            ['MYT4U', 'ON2U', 'OK4U', 'GRO4US', '2BIGPOWER', 'CD'].includes(asset.name)
        );

        console.log('📊 Загружено акций для продажи:', stocks.length);

        if (stocks.length === 0) {
            listElement.innerHTML = '<div class="asset-item" style="text-align: center; padding: 20px; color: #666;">Нет доступных акций для продажи</div>';
            return;
        }

        // Создаем HTML для списка акций
        const html = stocks.map(stock => {
            const totalValue = stock.quantity * stock.price;
            return `
                <div class="asset-item" data-asset-id="${stock.id}">
                    <span>${stock.name} (${stock.quantity} шт. × $${stock.price.toFixed(1)} = $${totalValue})</span>
                </div>
            `;
        }).join('');

        listElement.innerHTML = html;

        // Добавляем обработчики клика на акции
        const stockItems = listElement.querySelectorAll('.asset-item');
        stockItems.forEach(item => {
            item.addEventListener('click', () => {
                const assetId = item.dataset.assetId;
                this._selectAsset(assetId);
            });
        });
    }

    /**
     * Закрыть модальное окно продажи
     */
    closeSellModal() {
        let modal = null;
        
        if (window.DOM) {
            modal = window.DOM.get('sell-modal');
        } else {
            modal = document.getElementById('sell-modal');
        }
        
        if (modal) {
            modal.style.display = 'none';
        }
        
        this._selectedAsset = null;
        this._hideAllAssetInfo();
        this._disableSellButton();
    }
    
    /**
     * Скрыть всю информацию об активах
     */
    _hideAllAssetInfo() {
        const infoElements = [
            'selected-stock-info',
            'selected-realestate-info', 
            'selected-business-info',
            'selected-preciousmetals-info',
            'selected-misc-info'
        ];
        
        infoElements.forEach(id => {
            let element = null;
            if (window.DOM) {
                element = window.DOM.get(id);
            } else {
                element = document.getElementById(id);
            }
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    /**
     * Обновить кнопки выбора типа актива
     */
    _updateAssetTypeButtons() {
        const buttons = document.querySelectorAll('.asset-type-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === this._currentAssetType);
        });
    }
    
    /**
     * Отключить кнопку продажи
     */
    _disableSellButton() {
        const sellBtn = document.querySelector('#sell-asset-btn');
        if (sellBtn) {
            sellBtn.disabled = true;
        }
    }
    
    /**
     * Включить кнопку продажи
     */
    _enableSellButton() {
        const sellBtn = document.querySelector('#sell-asset-btn');
        if (sellBtn) {
            sellBtn.disabled = false;
        }
    }
    
    /**
     * Инициализация кнопок быстрых цен для продажи акций
     */
    _initializeSellPriceButtons(stockName) {
        // Убираем активное состояние со всех кнопок
        document.querySelectorAll('.quick-sell-price-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Скрываем кнопки для GRO4US и ON2U (нет цен $4 и $50)
        const hideButtons = ['GRO4US', 'ON2U'].includes(stockName);
        
        document.querySelectorAll('.quick-sell-price-btn').forEach(btn => {
            const price = parseInt(btn.dataset.price);
            if (hideButtons && (price === 4 || price === 50)) {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'block';
            }
        });
        
        // Добавляем обработчики событий для кнопок
        document.querySelectorAll('.quick-sell-price-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const price = this.dataset.price;
                // Ищем поле ввода в новом модальном окне
                const sellPriceInput = document.querySelector('#sell-asset-modal .sell-price') || document.querySelector('.sell-price');
                
                console.log('🎯 Клик по кнопке быстрой цены продажи:', price);
                
                // Убираем активное состояние со всех кнопок
                document.querySelectorAll('.quick-sell-price-btn').forEach(b => b.classList.remove('active'));
                
                // Добавляем активное состояние к нажатой кнопке
                this.classList.add('active');
                
                // Устанавливаем цену в поле ввода
                if (sellPriceInput) {
                    sellPriceInput.value = price;
                    console.log('✅ Цена установлена в поле ввода:', price);
                } else {
                    console.log('❌ Поле ввода цены не найдено');
                }
                
                // Запускаем расчет (используем правильный контекст)
                if (window.assetManager) {
                    window.assetManager._updateSellModalCalculations();
                }
            });
        });
    }

    /**
     * Переключить тип актива
     */
    _switchAssetType(assetType) {
        console.log(`🔄 Переключение типа актива: ${this._currentAssetType} → ${assetType}`);
        this._currentAssetType = assetType;
        this._updateAssetTypeButtons();
        this._loadAssetList();
        this._hideAllAssetInfo();
    }
    
    /**
     * Загрузить список активов для продажи
     */
    _loadAssetList() {
        // Используем правильную структуру данных
        let assets = [];
        
        // Приоритет: сначала window.data (где реально сохраняются покупки), потом gameState
        if (window.data && window.data.asset) {
            assets = window.data.asset || [];
            console.log('📊 Используем window.data (основной источник)');
        } else if (window.gameState && window.gameState.data) {
            assets = window.gameState.data.asset || [];
            console.log('📊 Используем GameState данные (fallback)');
        } else {
            console.log('❌ Данные не найдены');
            return;
        }
        
        console.log('📊 Все активы:', assets);
        
        // Фильтруем активы по типу
        const filteredAssets = assets.filter(asset => {
            if (this._currentAssetType === 'stocks') {
                // Проверяем, что это акции (по типу или по названию)
                const isStock = asset.type === 'stocks' || 
                               ['MYT4U', 'ON2U', 'OK4U', 'GRO4US', '2BIGPOWER', 'CD'].includes(asset.name);
                console.log(`🔍 Проверка акции ${asset.name}:`, isStock);
                return isStock;
            }
            return asset.type === this._currentAssetType;
        });
        
        console.log(`📋 Отфильтрованные активы (${this._currentAssetType}):`, filteredAssets);
        this._renderAssetList(filteredAssets);
    }

    /**
     * Отрисовать список активов
     */
    _renderAssetList(assets) {
        const listElement = this._getAssetListElement();
        if (!listElement) {
            console.log('❌ Элемент списка не найден для типа:', this._currentAssetType);
            return;
        }
        
        console.log(`🎨 Отрисовка ${assets.length} активов в элемент:`, listElement);
        
        if (assets.length === 0) {
            listElement.innerHTML = '<div class="asset-item">Нет доступных активов для продажи</div>';
            console.log('📝 Отображено сообщение "Нет активов"');
            return;
        }
        
        const html = assets.map(asset => {
            let displayText = '';
            if (this._currentAssetType === 'stocks') {
                const totalValue = asset.quantity * asset.price;
                displayText = `${asset.name} (${asset.quantity} шт. × $${asset.price.toFixed(1)} = $${totalValue})`;
            } else {
                displayText = `${asset.name} - $${asset.value}`;
            }
            
            return `<div class="asset-item" data-asset-id="${asset.id}">
                <span>${displayText}</span>
            </div>`;
        }).join('');
        
        listElement.innerHTML = html;
        
        // Добавляем обработчики клика
        const assetItems = listElement.querySelectorAll('.asset-item');
        assetItems.forEach(item => {
            item.addEventListener('click', () => {
                const assetId = item.dataset.assetId;
                this._selectAsset(assetId);
            });
        });
    }

    /**
     * Выбрать актив для продажи
     */
    _selectAsset(assetId) {
        // Используем правильную структуру данных
        let assets = [];
        
        // Приоритет: сначала window.data (где реально сохраняются покупки), потом gameState
        if (window.data && window.data.asset) {
            assets = window.data.asset || [];
        } else if (window.gameState && window.gameState.data) {
            assets = window.gameState.data.asset || [];
        } else {
            console.log('❌ Данные не найдены для выбора актива');
            return;
        }
        
        const asset = assets.find(a => a.id === assetId);
        if (!asset) {
            console.log('❌ Актив не найден:', assetId);
            return;
        }
        
        console.log('✅ Выбран актив:', asset);
        this._selectedAsset = asset;
        
        // Открываем новое модальное окно для продажи актива
        this._openSellAssetModal(asset);
    }

    /**
     * Открыть модальное окно продажи конкретного актива
     */
    _openSellAssetModal(asset) {
        console.log('🔍 Попытка открыть модальное окно продажи актива:', asset);
        
        const modal = document.getElementById('sell-asset-modal');
        console.log('🔍 Найденное модальное окно:', modal);
        
        if (!modal) {
            console.log('❌ Модальное окно продажи актива не найдено');
            return;
        }

        // Заполняем информацию об активе
        this._fillSellAssetModal(asset);
        
        // Показываем модальное окно
        modal.style.display = 'block';
        
        console.log('🎯 Открыто модальное окно продажи актива:', asset.name);
    }

    /**
     * Закрыть модальное окно продажи актива
     */
    closeSellAssetModal() {
        const modal = document.getElementById('sell-asset-modal');
        if (modal) {
            modal.style.display = 'none';
            this._selectedAsset = null;
        }
    }

    /**
     * Заполнить модальное окно продажи актива
     */
    _fillSellAssetModal(asset) {
        console.log('🔍 Заполнение модального окна продажи для актива:', asset);
        
        const titleElement = document.getElementById('sell-asset-title');
        const infoElement = document.getElementById('sell-asset-info');
        const formElement = document.getElementById('sell-asset-form');
        
        console.log('🔍 Найденные элементы:', { titleElement, infoElement, formElement });
        
        if (!titleElement || !infoElement || !formElement) {
            console.log('❌ Элементы модального окна продажи не найдены');
            return;
        }

        // Заполняем заголовок
        titleElement.textContent = `Продажа ${asset.name}`;

        // Заполняем информацию об активе в зависимости от типа
        if (asset.type === 'stocks') {
            console.log('🔍 Заполняем модальное окно для акций');
            this._fillSellStockModal(asset, infoElement, formElement);
        } else {
            console.log('🔍 Используем старую логику для других типов активов');
            // Для других типов пока используем старую логику
            this._showAssetInfo(asset);
            this._enableSellButton();
        }
    }

    /**
     * Заполнить модальное окно продажи акций
     */
    _fillSellStockModal(asset, infoElement, formElement) {
        // Проверяем, что актив существует и имеет необходимые свойства
        if (!asset || !asset.name || typeof asset.quantity === 'undefined' || typeof asset.price === 'undefined') {
            console.log('❌ Некорректные данные актива:', asset);
            return;
        }
        
        // Информация об акции
        infoElement.innerHTML = `
            <div class="asset-info">
                <h3>${asset.name}</h3>
                <p><strong>Количество:</strong> ${asset.quantity} шт.</p>
                <p><strong>Средняя цена покупки:</strong> $${asset.price.toFixed(1)}</p>
                <p><strong>Общая стоимость:</strong> $${(asset.quantity * asset.price).toFixed(0)}</p>
            </div>
        `;

        // Форма продажи
        formElement.innerHTML = `
            <div class="sell-form">
                <div class="input-group">
                    <label>Количество для продажи:</label>
                    <input type="number" class="sell-quantity" min="1" max="${asset.quantity}" value="${asset.quantity}" step="1">
                </div>
                
                <div class="input-group">
                    <label>Цена продажи за акцию ($):</label>
                    <div class="quick-sell-price-buttons">
                        <button class="quick-sell-price-btn" data-price="1">$1</button>
                        <button class="quick-sell-price-btn" data-price="4">$4</button>
                        <button class="quick-sell-price-btn" data-price="5">$5</button>
                        <button class="quick-sell-price-btn" data-price="10">$10</button>
                        <button class="quick-sell-price-btn" data-price="20">$20</button>
                        <button class="quick-sell-price-btn" data-price="30">$30</button>
                        <button class="quick-sell-price-btn" data-price="40">$40</button>
                        <button class="quick-sell-price-btn" data-price="50">$50</button>
                    </div>
                    <div class="custom-sell-price-input">
                        <input type="number" class="sell-price" min="0" value="${asset.price}" step="1">
                    </div>
                </div>
                
                <div class="total-info">
                    <p><strong>Итого к получению:</strong> <span class="sell-total">$${(asset.quantity * asset.price).toFixed(0)}</span></p>
                </div>
            </div>
        `;

        // Инициализируем кнопки быстрых цен
        this._initializeSellPriceButtons(asset.name);
        
        // Добавляем обработчики событий
        this._addSellModalEventHandlers();
    }

    /**
     * Добавить обработчики событий для модального окна продажи
     */
    _addSellModalEventHandlers() {
        // Обработчик для кнопки подтверждения продажи
        const confirmBtn = document.getElementById('confirm-sell-btn');
        if (confirmBtn) {
            confirmBtn.onclick = () => this._executeSellFromModal();
        }

        // Обработчики для полей ввода
        const quantityInput = document.querySelector('#sell-asset-modal .sell-quantity');
        const priceInput = document.querySelector('#sell-asset-modal .sell-price');
        
        if (quantityInput) {
            quantityInput.addEventListener('input', () => this._updateSellModalCalculations());
        }
        if (priceInput) {
            priceInput.addEventListener('input', () => this._updateSellModalCalculations());
        }
    }

    /**
     * Обновить расчеты в модальном окне продажи
     */
    _updateSellModalCalculations() {
        const quantityInput = document.querySelector('#sell-asset-modal .sell-quantity');
        const priceInput = document.querySelector('#sell-asset-modal .sell-price');
        const totalElement = document.querySelector('#sell-asset-modal .sell-total');
        
        if (!quantityInput || !priceInput || !totalElement) return;
        
        const quantity = parseInt(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = quantity * price;
        
        totalElement.textContent = `$${total.toFixed(0)}`;
    }

    /**
     * Выполнить продажу из модального окна
     */
    _executeSellFromModal() {
        if (!this._selectedAsset) return;
        
        const quantityInput = document.querySelector('#sell-asset-modal .sell-quantity');
        const priceInput = document.querySelector('#sell-asset-modal .sell-price');
        
        if (!quantityInput || !priceInput) return;
        
        const quantity = parseInt(quantityInput.value) || 0;
        const sellPrice = parseFloat(priceInput.value) || 0;
        
        if (sellPrice <= 0) {
            alert('Цена продажи должна быть больше 0!');
            return;
        }
        
        if (quantity <= 0 || quantity > this._selectedAsset.quantity) {
            alert('Некорректное количество для продажи!');
            return;
        }
        
        // Сохраняем информацию об активе для уведомления
        const assetName = this._selectedAsset.name;
        
        // Рассчитываем выручку
        const revenue = quantity * sellPrice;
        
        console.log(`💰 Продажа актива из модального окна: ${assetName} ${quantity} шт. за $${sellPrice}, выручка: $${revenue}`);
        
        // Добавляем деньги
        if (window.data) {
            window.cash += revenue;
            
            // Обновляем или удаляем актив
            if (quantity === this._selectedAsset.quantity) {
                // Продаем все - удаляем актив
                const assetIndex = window.data.asset.findIndex(a => a.id === this._selectedAsset.id);
                if (assetIndex !== -1) {
                    window.data.asset.splice(assetIndex, 1);
                }
            } else {
                // Продаем часть - уменьшаем количество
                const asset = window.data.asset.find(a => a.id === this._selectedAsset.id);
                if (asset) {
                    asset.quantity -= quantity;
                }
            }
            
            // Сохраняем данные
            if (window.saveData) {
                window.saveData();
            }
            
            // Обновляем отображение
            if (window.renderAll) {
                window.renderAll();
            }
        }
        
        // Закрываем модальное окно продажи актива
        this.closeSellAssetModal();
        
        // Очищаем выбранный актив
        this._selectedAsset = null;
        
        // Обновляем список активов в основном модальном окне продажи
        this._loadAssetList();
        
        // Обновляем список акций в модальном окне списка акций
        this._loadStocksList();
        
        // Показываем уведомление
        if (window.animationManager) {
            window.animationManager.showNotification(`✅ Продано: ${assetName} ${quantity} шт. за $${sellPrice}`, 'success');
        }
    }

    /**
     * Показать информацию об активе
     */
    _showAssetInfo(asset) {
        this._hideAllAssetInfo();
        
        const infoElement = this._getAssetInfoElement();
        if (!infoElement) return;
        
        infoElement.style.display = 'block';
        
        // Заполняем информацию в зависимости от типа актива
        if (this._currentAssetType === 'stocks') {
            this._fillStockInfo(asset);
        } else if (this._currentAssetType === 'realestate') {
            this._fillRealEstateInfo(asset);
        } else if (this._currentAssetType === 'business') {
            this._fillBusinessInfo(asset);
        } else if (this._currentAssetType === 'preciousmetals') {
            this._fillPreciousMetalsInfo(asset);
        } else if (this._currentAssetType === 'misc') {
            this._fillMiscInfo(asset);
        }
    }

    /**
     * Скрыть всю информацию об активах
     */
    _hideAllAssetInfo() {
        const infoElements = [
            'selected-stock-info',
            'selected-realestate-info',
            'selected-business-info',
            'selected-preciousmetals-info',
            'selected-misc-info'
        ];
        
        infoElements.forEach(id => {
            const element = window.DOM?.get(id);
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    /**
     * Включить кнопку продажи
     */
    _enableSellButton() {
        const sellBtn = window.DOM?.get('sell-asset-btn');
        if (sellBtn) {
            sellBtn.disabled = false;
        }
    }

    /**
     * Отключить кнопку продажи
     */
    _disableSellButton() {
        const sellBtn = window.DOM?.get('sell-asset-btn');
        if (sellBtn) {
            sellBtn.disabled = true;
        }
    }

    /**
     * Продать выбранный актив
     */
    sellSelectedAsset() {
        if (!this._selectedAsset || !window.gameState) return;
        
        const asset = this._selectedAsset;
        const sellPriceInput = document.querySelector('.sell-price');
        const sellPrice = sellPriceInput ? Number(sellPriceInput.value) : 0;
        
        if (sellPrice <= 0) {
            alert('Введите корректную цену продажи');
            return;
        }
        
        // Рассчитываем выручку
        let revenue = 0;
        if (asset.type === 'stocks') {
            revenue = asset.quantity * sellPrice;
        } else {
            revenue = sellPrice;
        }
        
        // Добавляем деньги
        window.gameState.addCash(revenue, `Продажа ${asset.name}`);
        
        // Удаляем актив
        window.gameState.removeAsset(asset.id);
        
        // Закрываем модальное окно
        this.closeSellModal();
        
        // Отправляем событие
        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.ASSET_REMOVED, {
                asset: asset,
                revenue: revenue,
                sellPrice: sellPrice
            });
        }
    }

    // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

    /**
     * Получить элемент списка активов
     */
    _getAssetListElement() {
        const listMap = {
            'stocks': 'stock-list',
            'realestate': 'realestate-list',
            'business': 'business-list',
            'preciousmetals': 'preciousmetals-list',
            'misc': 'misc-list'
        };
        
        const listId = listMap[this._currentAssetType];
        if (!listId) {
            console.log('❌ Неизвестный тип актива:', this._currentAssetType);
            return null;
        }
        
        let element = null;
        if (window.DOM) {
            element = window.DOM.get(listId);
        } else {
            element = document.getElementById(listId);
        }
        
        console.log(`🔍 Поиск элемента списка: ${listId} =`, element);
        return element;
    }


    
    /**
     * Заполнить информацию об акции
     */
    _fillStockInfo(asset) {
        const nameElement = document.querySelector('.selected-stock-name');
        const quantityElement = document.querySelector('.selected-stock-quantity');
        const priceElement = document.querySelector('.selected-stock-buy-price');
        
        if (nameElement) nameElement.textContent = asset.name;
        if (quantityElement) quantityElement.textContent = asset.quantity;
        if (priceElement) priceElement.textContent = `$${asset.price}`;
        
        // Устанавливаем максимальное количество для продажи
        const quantityInput = document.querySelector('.sell-quantity');
        if (quantityInput) {
            quantityInput.max = asset.quantity;
            quantityInput.value = asset.quantity;
        }
        
        // Устанавливаем цену продажи равной цене покупки по умолчанию
        const sellPriceInput = document.querySelector('.sell-price');
        if (sellPriceInput) {
            sellPriceInput.value = asset.price;
        }
        
        // Инициализируем кнопки быстрых цен для продажи
        this._initializeSellPriceButtons(asset.name);
        
        // Обновляем расчеты
        this._updateSellCalculations();
    }
    
    /**
     * Заполнить информацию о недвижимости
     */
    _fillRealEstateInfo(asset) {
        const nameElement = document.querySelector('.selected-realestate-name');
        const valueElement = document.querySelector('.selected-realestate-value');
        
        if (nameElement) nameElement.textContent = asset.name;
        if (valueElement) valueElement.textContent = `$${asset.value}`;
        
        // Устанавливаем цену продажи равной стоимости по умолчанию
        const sellPriceInput = document.querySelector('.sell-realestate-price');
        if (sellPriceInput) {
            sellPriceInput.value = asset.value;
        }
        
        this._updateRealEstateSellCalculations();
    }
    
    /**
     * Заполнить информацию о бизнесе
     */
    _fillBusinessInfo(asset) {
        const nameElement = document.querySelector('.selected-business-name');
        const valueElement = document.querySelector('.selected-business-value');
        
        if (nameElement) nameElement.textContent = asset.name;
        if (valueElement) valueElement.textContent = `$${asset.value}`;
        
        // Устанавливаем цену продажи равной стоимости по умолчанию
        const sellPriceInput = document.querySelector('.sell-business-price');
        if (sellPriceInput) {
            sellPriceInput.value = asset.value;
        }
        
        this._updateBusinessSellCalculations();
    }
    
    /**
     * Заполнить информацию о драгметаллах
     */
    _fillPreciousMetalsInfo(asset) {
        const nameElement = document.querySelector('.selected-preciousmetals-name');
        const valueElement = document.querySelector('.selected-preciousmetals-value');
        
        if (nameElement) nameElement.textContent = asset.name;
        if (valueElement) valueElement.textContent = `$${asset.value}`;
        
        // Устанавливаем цену продажи равной стоимости по умолчанию
        const sellPriceInput = document.querySelector('.sell-preciousmetals-price');
        if (sellPriceInput) {
            sellPriceInput.value = asset.value;
        }
        
        this._updatePreciousMetalsSellCalculations();
    }
    
    /**
     * Заполнить информацию о misc активе
     */
    _fillMiscInfo(asset) {
        const nameElement = document.querySelector('.selected-misc-name');
        const valueElement = document.querySelector('.selected-misc-value');
        
        if (nameElement) nameElement.textContent = asset.name;
        if (valueElement) valueElement.textContent = `$${asset.value}`;
        
        // Устанавливаем цену продажи равной стоимости по умолчанию
        const sellPriceInput = document.querySelector('.sell-misc-price');
        if (sellPriceInput) {
            sellPriceInput.value = asset.value;
        }
        
        this._updateMiscSellCalculations();
    }
    
    /**
     * Получить элемент информации об активе
     */
    _getAssetInfoElement() {
        const infoMap = {
            'stocks': 'selected-stock-info',
            'realestate': 'selected-realestate-info',
            'business': 'selected-business-info',
            'preciousmetals': 'selected-preciousmetals-info',
            'misc': 'selected-misc-info'
        };
        
        const infoId = infoMap[this._currentAssetType];
        if (!infoId) return null;
        
        let element = null;
        if (window.DOM) {
            element = window.DOM.get(infoId);
        } else {
            element = document.getElementById(infoId);
        }
        return element;
    }

    // === ОБРАБОТЧИКИ СОБЫТИЙ ===

    _handleAssetChanged(data) {
        // Обновляем списки активов при изменении
        if (data.operation === 'add' || data.operation === 'remove') {
            this._loadAssetList();
        }
    }

    _handleCashChanged(data) {
        // Обновляем баланс в модальных окнах
        this._updateBuyModalWallet();
    }

    // === ПУБЛИЧНЫЕ МЕТОДЫ ===

    /**
     * Рассчитать общую стоимость активов
     */
    calculateTotalAssets() {
        if (!window.gameState) return 0;
        
        return window.gameState.calculateTotalAssets();
    }

    /**
     * Получить активы определенного типа
     */
    getAssetsByType(type) {
        if (!window.gameState) return [];
        
        return window.gameState.data.asset.filter(asset => asset.type === type);
    }

    /**
     * Получить все активы
     */
    getAllAssets() {
        if (!window.gameState) return [];
        
        return window.gameState.data.asset;
    }
    
    // === МЕТОДЫ ДЛЯ РАСЧЕТОВ ПРОДАЖИ ===
    
    /**
     * Обновить расчеты продажи акций
     */
    _updateSellCalculations() {
        const quantityInput = document.querySelector('.sell-quantity');
        const priceInput = document.querySelector('.sell-price');
        const totalElement = document.querySelector('.sell-total');
        
        if (!quantityInput || !priceInput || !totalElement) return;
        
        const quantity = parseInt(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const total = quantity * price;
        
        totalElement.textContent = `$${total}`;
    }
    
    /**
     * Обновить расчеты продажи недвижимости
     */
    _updateRealEstateSellCalculations() {
        const priceInput = document.querySelector('.sell-realestate-price');
        const totalElement = document.querySelector('.sell-realestate-total');
        
        if (!priceInput || !totalElement) return;
        
        const price = parseFloat(priceInput.value) || 0;
        totalElement.textContent = `$${price}`;
    }
    
    /**
     * Обновить расчеты продажи бизнеса
     */
    _updateBusinessSellCalculations() {
        const priceInput = document.querySelector('.sell-business-price');
        const totalElement = document.querySelector('.sell-business-total');
        
        if (!priceInput || !totalElement) return;
        
        const price = parseFloat(priceInput.value) || 0;
        totalElement.textContent = `$${price}`;
    }
    
    /**
     * Обновить расчеты продажи драгметаллов
     */
    _updatePreciousMetalsSellCalculations() {
        const priceInput = document.querySelector('.sell-preciousmetals-price');
        const totalElement = document.querySelector('.sell-preciousmetals-total');
        
        if (!priceInput || !totalElement) return;
        
        const price = parseFloat(priceInput.value) || 0;
        totalElement.textContent = `$${price}`;
    }
    
    /**
     * Обновить расчеты продажи misc активов
     */
    _updateMiscSellCalculations() {
        const priceInput = document.querySelector('.sell-misc-price');
        const totalElement = document.querySelector('.sell-misc-total');
        
        if (!priceInput || !totalElement) return;
        
        const price = parseFloat(priceInput.value) || 0;
        totalElement.textContent = `$${price}`;
    }
    
    /**
     * Обработчик продажи актива
     */
    _sellAsset() {
        if (!this._selectedAsset) return;
        
        let sellPrice = 0;
        
        // Получаем цену продажи в зависимости от типа актива
        if (this._currentAssetType === 'stocks') {
            sellPrice = parseFloat(document.querySelector('.sell-price')?.value) || 0;
        } else if (this._currentAssetType === 'realestate') {
            sellPrice = parseFloat(document.querySelector('.sell-realestate-price')?.value) || 0;
        } else if (this._currentAssetType === 'business') {
            sellPrice = parseFloat(document.querySelector('.sell-business-price')?.value) || 0;
        } else if (this._currentAssetType === 'preciousmetals') {
            sellPrice = parseFloat(document.querySelector('.sell-preciousmetals-price')?.value) || 0;
        } else if (this._currentAssetType === 'misc') {
            sellPrice = parseFloat(document.querySelector('.sell-misc-price')?.value) || 0;
        }
        
        if (sellPrice < 0) {
            alert('Цена продажи не может быть отрицательной!');
            return;
        }
        
        this._executeSellAsset(this._selectedAsset, sellPrice);
    }
    
    /**
     * Выполнить продажу актива
     */
    _executeSellAsset(asset, sellPrice) {
        // Рассчитываем выручку
        let revenue = 0;
        if (this._currentAssetType === 'stocks') {
            const quantityInput = document.querySelector('.sell-quantity');
            const quantity = parseInt(quantityInput?.value) || asset.quantity;
            revenue = quantity * sellPrice;
        } else {
            revenue = sellPrice;
        }
        
        console.log(`💰 Продажа актива: ${asset.name} за $${sellPrice}, выручка: $${revenue}`);
        
        // Добавляем деньги (приоритет: window.data, потом gameState)
        if (window.data) {
            // Используем основную логику с window.data
            window.cash += revenue;
            
            // Удаляем актив из массива
            const assetIndex = window.data.asset.findIndex(a => a.id === asset.id);
            if (assetIndex !== -1) {
                window.data.asset.splice(assetIndex, 1);
            }
            
            // Сохраняем данные
            if (window.saveData) {
                window.saveData();
            }
            
            // Обновляем отображение
            if (window.renderAll) {
                window.renderAll();
            }
        } else if (window.gameState) {
            // Fallback на gameState
            window.gameState.addCash(revenue, `Продажа ${asset.name}`);
            window.gameState.removeAsset(asset.id);
        }
        
        // Закрываем модальное окно
        this.closeSellModal();
        
        // Отправляем событие
        if (window.eventBus) {
            window.eventBus.emit(window.AppEvents.ASSET_REMOVED, {
                asset: asset,
                revenue: revenue,
                sellPrice: sellPrice
            });
        }
        
        // Показываем уведомление
        if (window.animationManager) {
            window.animationManager.showNotification(`✅ Продано: ${asset.name} за $${sellPrice}`, 'success');
        }
    }
}

// Создаем глобальный экземпляр AssetManager
window.assetManager = new AssetManager();

// Инициализируем AssetManager после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    if (window.assetManager) {
        window.assetManager.init();
    }
});
