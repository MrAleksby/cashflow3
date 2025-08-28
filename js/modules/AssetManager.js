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
            window.DOM.addEventListener('main-buy-btn', 'click', () => this.openBuyModal());
            window.DOM.addEventListener('main-sell-btn', 'click', () => this.openSellModal());
        }
    }

    // === МЕТОДЫ ДЛЯ ПОКУПКИ АКТИВОВ ===

    /**
     * Открыть модальное окно покупки
     */
    openBuyModal() {
        if (!window.DOM) return;
        
        const modal = window.DOM.get('buy-modal');
        if (modal) {
            modal.style.display = 'block';
            this._updateBuyModalWallet();
            this._initBuyModalHandlers();
        }
    }

    /**
     * Закрыть модальное окно покупки
     */
    closeBuyModal() {
        if (!window.DOM) return;
        
        const modal = window.DOM.get('buy-modal');
        if (modal) {
            modal.style.display = 'none';
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
        if (!window.DOM) return;
        
        const modal = window.DOM.get('sell-modal');
        if (modal) {
            modal.style.display = 'block';
            this._currentAssetType = 'stocks';
            this._updateAssetTypeButtons();
            this._loadAssetList();
        }
    }

    /**
     * Закрыть модальное окно продажи
     */
    closeSellModal() {
        if (!window.DOM) return;
        
        const modal = window.DOM.get('sell-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        this._selectedAsset = null;
        this._hideAllAssetInfo();
        this._disableSellButton();
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
     * Загрузить список активов для продажи
     */
    _loadAssetList() {
        if (!window.gameState) return;
        
        const assets = window.gameState.data.asset;
        
        // Фильтруем активы по типу
        const filteredAssets = assets.filter(asset => {
            if (this._currentAssetType === 'stocks') {
                return ['MYT4U', 'ON2U', 'OK4U', 'GRO4US', '2BIGPOWER', 'CD'].includes(asset.name);
            }
            return asset.type === this._currentAssetType;
        });
        
        this._renderAssetList(filteredAssets);
    }

    /**
     * Отрисовать список активов
     */
    _renderAssetList(assets) {
        const listElement = this._getAssetListElement();
        if (!listElement) return;
        
        if (assets.length === 0) {
            listElement.innerHTML = '<div class="asset-item">Нет доступных активов для продажи</div>';
            return;
        }
        
        const html = assets.map(asset => {
            let displayText = '';
            if (asset.type === 'stocks') {
                displayText = `${asset.name} (${asset.quantity} шт. по $${asset.price})`;
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
        if (!window.gameState) return;
        
        const asset = window.gameState.data.asset.find(a => a.id === assetId);
        if (!asset) return;
        
        this._selectedAsset = asset;
        this._showAssetInfo(asset);
        this._enableSellButton();
    }

    /**
     * Показать информацию об активе
     */
    _showAssetInfo(asset) {
        this._hideAllAssetInfo();
        
        const infoElement = this._getAssetInfoElement();
        if (!infoElement) return;
        
        let infoHtml = '';
        if (asset.type === 'stocks') {
            infoHtml = `
                <h3>${asset.name}</h3>
                <p>Количество: ${asset.quantity} шт.</p>
                <p>Цена за акцию: $${asset.price}</p>
                <p>Общая стоимость: $${asset.quantity * asset.price}</p>
                <div class="sell-price-input">
                    <label>Цена продажи за акцию:</label>
                    <input type="number" class="sell-price" value="${asset.price}">
                </div>
            `;
        } else {
            infoHtml = `
                <h3>${asset.name}</h3>
                <p>Стоимость: $${asset.value}</p>
                <div class="sell-price-input">
                    <label>Цена продажи:</label>
                    <input type="number" class="sell-price" value="${asset.value}">
                </div>
            `;
        }
        
        infoElement.innerHTML = infoHtml;
        infoElement.style.display = 'block';
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
        return listId ? window.DOM?.get(listId) : null;
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
        return infoId ? window.DOM?.get(infoId) : null;
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
}

// Создаем глобальный экземпляр AssetManager
window.assetManager = new AssetManager();
