// Обработка если я выбрал навигации
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Убираем активный класс у всех кнопок
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Добавляем активный класс нажатой кнопке
        item.classList.add('active');
        
        // Получаем название секции из data-атрибута
        const section = item.dataset.section;
        
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        
        // Показываем нужный экран
        const targetScreen = document.querySelector(`#screen-${section}`);
        if (targetScreen) {
            targetScreen.style.display = 'block';
        }
    });
}); 

// Функционал продажи активов
const sellModal = document.getElementById('sell-modal');
const stockList = document.getElementById('stock-list');
const realEstateList = document.getElementById('realestate-list');
const businessList = document.getElementById('business-list');
const preciousMetalsList = document.getElementById('preciousmetals-list');
const miscList = document.getElementById('misc-list');
const selectedStockInfo = document.getElementById('selected-stock-info');
const selectedRealEstateInfo = document.getElementById('selected-realestate-info');
const selectedBusinessInfo = document.getElementById('selected-business-info');
const selectedPreciousMetalsInfo = document.getElementById('selected-preciousmetals-info');
const selectedMiscInfo = document.getElementById('selected-misc-info');
const sellPriceInput = document.querySelector('.sell-price');
const sellRealEstatePriceInput = document.querySelector('.sell-realestate-price');
const sellBusinessPriceInput = document.querySelector('.sell-business-price');
const sellPreciousMetalsPriceInput = document.querySelector('.sell-preciousmetals-price');
const sellMiscPriceInput = document.querySelector('.sell-misc-price');
const sellAssetBtn = document.getElementById('sell-asset-btn');
const cancelSellBtn = document.getElementById('cancel-sell-btn');

let selectedAsset = null;
let currentAssetType = 'stocks';

// Открытие модального окна продажи
function openSellStockModal() {
    sellModal.style.display = 'block';
    currentAssetType = 'stocks';
    updateAssetTypeButtons();
    loadStockList();
}

// Закрытие модального окна
function closeSellStockModal() {
    sellModal.style.display = 'none';
    selectedAsset = null;
    selectedStockInfo.style.display = 'none';
    selectedRealEstateInfo.style.display = 'none';
    selectedBusinessInfo.style.display = 'none';
    selectedPreciousMetalsInfo.style.display = 'none';
    selectedMiscInfo.style.display = 'none';
    sellAssetBtn.disabled = true;
}

// Обновление кнопок выбора типа актива
function updateAssetTypeButtons() {
    const buttons = document.querySelectorAll('.asset-type-btn');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === currentAssetType);
    });
}

// Загрузка списка акций
function loadStockList() {
    stockList.innerHTML = '';
    const assets = window.data.asset || [];
    
    // Фильтруем только акции из активов
    const stocks = assets.filter(asset => 
        ['MYT4U', 'ON2U', 'OK4U', 'GRO4US', '2BIGPOWER', 'CD'].includes(asset.name)
    );
    
    if (stocks.length === 0) {
        stockList.innerHTML = '<div class="asset-item">Нет доступных акций для продажи</div>';
        return;
    }
    
    stocks.forEach(stock => {
        const stockItem = document.createElement('div');
        stockItem.className = 'asset-item';
        const totalValue = stock.quantity * stock.price;
        stockItem.innerHTML = `
            <span>${stock.name} (${stock.quantity} шт. × $${stock.price.toFixed(1)} = $${totalValue})</span>
        `;
        
        stockItem.addEventListener('click', () => selectAsset(stock, 'stocks'));
        stockList.appendChild(stockItem);
    });
}

// Загрузка списка недвижимости
function loadRealEstateList() {
    realEstateList.innerHTML = '';
    const assets = window.data.asset || [];
    
    // Фильтруем только недвижимость
    const realEstate = assets.filter(asset => asset.type === 'realestate');
    
    if (realEstate.length === 0) {
        realEstateList.innerHTML = '<div class="asset-item">Нет доступной недвижимости для продажи</div>';
        return;
    }
    
    realEstate.forEach(property => {
        const propertyItem = document.createElement('div');
        propertyItem.className = 'asset-item';
        propertyItem.innerHTML = `
            <span>${property.name}</span>
            <span>$${property.value}</span>
        `;
        
        propertyItem.addEventListener('click', () => selectAsset(property, 'realestate'));
        realEstateList.appendChild(propertyItem);
    });
}

// Загрузка списка бизнесов
function loadBusinessList() {
    businessList.innerHTML = '';
    const assets = window.data.asset || [];
    
    // Фильтруем только бизнесы
    const businesses = assets.filter(asset => asset.type === 'business');
    
    if (businesses.length === 0) {
        businessList.innerHTML = '<div class="asset-item">Нет доступных бизнесов для продажи</div>';
        return;
    }
    
    businesses.forEach(business => {
        const businessItem = document.createElement('div');
        businessItem.className = 'asset-item';
        businessItem.innerHTML = `
            <span>${business.name}</span>
            <span>$${business.value}</span>
        `;
        
        businessItem.addEventListener('click', () => selectAsset(business, 'business'));
        businessList.appendChild(businessItem);
    });
}

// Загрузка списка драгметаллов
function loadPreciousMetalsList() {
    preciousMetalsList.innerHTML = '';
    const assets = window.data.asset || [];
    
    // Фильтруем только драгметаллы
    const metals = assets.filter(asset => asset.type === 'preciousmetals');
    
    if (metals.length === 0) {
        preciousMetalsList.innerHTML = '<div class="asset-item">Нет доступных драгметаллов для продажи</div>';
        return;
    }
    
    metals.forEach(metal => {
        const metalItem = document.createElement('div');
        metalItem.className = 'asset-item';
        metalItem.innerHTML = `
            <span>${metal.name}</span>
            <span>$${metal.value}</span>
        `;
        
        metalItem.addEventListener('click', () => selectAsset(metal, 'preciousmetals'));
        preciousMetalsList.appendChild(metalItem);
    });
}

// Загрузка списка всякой всячины
function loadMiscList() {
    miscList.innerHTML = '';
    const assets = window.data.asset || [];
    
    // Фильтруем только всякую всячину
    const miscItems = assets.filter(asset => asset.type === 'misc');
    
    if (miscItems.length === 0) {
        miscList.innerHTML = '<div class="asset-item">Нет доступных предметов для продажи</div>';
        return;
    }
    
    miscItems.forEach(item => {
        const miscItem = document.createElement('div');
        miscItem.className = 'asset-item';
        miscItem.innerHTML = `
            <span>${item.name}</span>
            <span>$${item.value}</span>
        `;
        
        miscItem.addEventListener('click', () => selectAsset(item, 'misc'));
        miscList.appendChild(miscItem);
    });
}

// Обновление отображения списков при смене типа актива
function updateAssetDisplay() {
    stockList.style.display = currentAssetType === 'stocks' ? 'block' : 'none';
    realEstateList.style.display = currentAssetType === 'realestate' ? 'block' : 'none';
    businessList.style.display = currentAssetType === 'business' ? 'block' : 'none';
    preciousMetalsList.style.display = currentAssetType === 'preciousmetals' ? 'block' : 'none';
    miscList.style.display = currentAssetType === 'misc' ? 'block' : 'none';
    
    selectedStockInfo.style.display = 'none';
    selectedRealEstateInfo.style.display = 'none';
    selectedBusinessInfo.style.display = 'none';
    selectedPreciousMetalsInfo.style.display = 'none';
    selectedMiscInfo.style.display = 'none';
    
    if (currentAssetType === 'stocks') {
        loadStockList();
    } else if (currentAssetType === 'realestate') {
        loadRealEstateList();
    } else if (currentAssetType === 'business') {
        loadBusinessList();
    } else if (currentAssetType === 'preciousmetals') {
        loadPreciousMetalsList();
    } else if (currentAssetType === 'misc') {
        loadMiscList();
    }
}

// Выбор актива для продажи - ОТКЛЮЧЕНО (используется новая логика AssetManager)
function selectAsset(asset, type) {
    // Старая логика отключена - теперь используется AssetManager
    console.log('🔧 Старая логика selectAsset отключена, используется AssetManager');
    return;
    
    // ЗАКОММЕНТИРОВАННЫЙ КОД:
    /*
    selectedAsset = asset;
    document.querySelectorAll('.asset-item').forEach(item => item.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    selectedStockInfo.style.display = 'none';
    selectedRealEstateInfo.style.display = 'none';
    selectedBusinessInfo.style.display = 'none';
    selectedPreciousMetalsInfo.style.display = 'none';
    selectedMiscInfo.style.display = 'none';
    
    if (type === 'stocks') {
        selectedStockInfo.style.display = 'block';
        selectedRealEstateInfo.style.display = 'none';
        
        document.querySelector('.selected-stock-name').textContent = asset.name;
        document.querySelector('.selected-stock-quantity').textContent = asset.quantity;
        document.querySelector('.selected-stock-buy-price').textContent = `$${asset.price}`;
        
        // Показываем информацию о дивидендах если это дивидендная акция
        const dividendInfo = document.querySelector('.dividend-info');
        if (['2BIGPOWER', 'CD'].includes(asset.name)) {
            dividendInfo.style.display = 'block';
            document.querySelector('.current-dividend').textContent = 
                `$${calculateDividends(asset.name, asset.quantity)}`;
        } else {
            dividendInfo.style.display = 'none';
        }
        
        // Устанавливаем максимальное количество для продажи
        const quantityInput = document.querySelector('.sell-quantity');
        quantityInput.max = asset.quantity;
        quantityInput.value = asset.quantity;
        
        // Устанавливаем цену продажи равной цене покупки по умолчанию
        sellPriceInput.value = asset.price;
        
        // Инициализируем кнопки быстрых цен для продажи
        initializeSellPriceButtons(asset.name);
        
        updateSellCalculations();
    } else if (type === 'realestate') {
        selectedStockInfo.style.display = 'none';
        selectedRealEstateInfo.style.display = 'block';
        
        document.querySelector('.selected-realestate-name').textContent = asset.name;
        document.querySelector('.selected-realestate-value').textContent = `$${asset.value}`;
        
        // Находим связанный доход
        const relatedIncome = window.data.income.find(inc => 
            inc.type === 'passive' && inc.source === asset.name
        );
        document.querySelector('.selected-realestate-income').textContent = 
            relatedIncome ? `$${relatedIncome.value}` : '$0';
        
        // Устанавливаем цену продажи равной стоимости по умолчанию
        sellRealEstatePriceInput.value = asset.value;
        
        updateRealEstateSellCalculations();
    } else if (type === 'business') {
        selectedBusinessInfo.style.display = 'block';
        
        document.querySelector('.selected-business-name').textContent = asset.name;
        document.querySelector('.selected-business-value').textContent = `$${asset.value}`;
        
        // Находим связанный доход
        const relatedIncome = window.data.income.find(inc => 
            inc.type === 'passive' && 
            inc.source === asset.name
        );
        document.querySelector('.selected-business-income').textContent = 
            relatedIncome ? `$${relatedIncome.value}` : '$0';
        
        // Устанавливаем цену продажи равной стоимости по умолчанию
        sellBusinessPriceInput.value = asset.value;
        
        updateBusinessSellCalculations();
    } else if (type === 'preciousmetals') {
        selectedPreciousMetalsInfo.style.display = 'block';
        
        document.querySelector('.selected-preciousmetals-name').textContent = asset.name;
        document.querySelector('.selected-preciousmetals-value').textContent = `$${asset.value}`;
        
        // Устанавливаем цену продажи равной стоимости по умолчанию
        sellPreciousMetalsPriceInput.value = asset.value;
        
        updatePreciousMetalsSellCalculations();
    } else if (type === 'misc') {
        selectedMiscInfo.style.display = 'block';
        
        document.querySelector('.selected-misc-name').textContent = asset.name;
        document.querySelector('.selected-misc-value').textContent = `$${asset.value}`;
        
        // Находим связанный расход
        const relatedExpense = window.data.expense ? window.data.expense.find(exp => 
            exp.name === `Обслуживание: ${asset.name}`
        ) : null;
        document.querySelector('.selected-misc-expense').textContent = 
            relatedExpense ? `$${relatedExpense.value}` : '$0';
    */
}

// Обновление расчетов при продаже акций
function updateSellCalculations() {
    if (!selectedAsset || currentAssetType !== 'stocks') return;
    
    const quantity = parseInt(document.querySelector('.sell-quantity').value) || 0;
    const price = parseFloat(sellPriceInput.value) || 0;
    const total = quantity * price;
    
    document.querySelector('.sell-total').textContent = `$${total}`;
    sellAssetBtn.disabled = quantity <= 0 || quantity > selectedAsset.quantity;
}

// Обновление расчетов при продаже недвижимости
function updateRealEstateSellCalculations() {
    if (!selectedAsset || currentAssetType !== 'realestate') return;
    
    const price = parseFloat(sellRealEstatePriceInput.value) || 0;
    document.querySelector('.sell-realestate-total').textContent = `$${price}`;
    sellAssetBtn.disabled = price < 0; // Разрешаем нулевую цену
}

// Обновление расчетов при продаже бизнеса
function updateBusinessSellCalculations() {
    if (!selectedAsset || currentAssetType !== 'business') return;
    
    const sellPrice = parseFloat(sellBusinessPriceInput.value) || 0;
    document.querySelector('.sell-business-total').textContent = `$${sellPrice}`;
    sellAssetBtn.disabled = sellPrice < 0; // Разрешаем нулевую цену
}

// Обновление расчетов при продаже драгметаллов
function updatePreciousMetalsSellCalculations() {
    if (!selectedAsset || currentAssetType !== 'preciousmetals') return;
    
    const price = parseFloat(sellPreciousMetalsPriceInput.value) || 0;
    document.querySelector('.sell-preciousmetals-total').textContent = `$${price}`;
    sellAssetBtn.disabled = price < 0; // Разрешаем нулевую цену
}

// Обновление расчетов при продаже всякой всячины
function updateMiscSellCalculations() {
    if (!selectedAsset || currentAssetType !== 'misc') return;
    
    const price = parseFloat(sellMiscPriceInput.value) || 0;
    document.querySelector('.sell-misc-total').textContent = `$${price}`;
    sellAssetBtn.disabled = price < 0; // Разрешаем нулевую цену
}

// Продажа актива
function sellAsset() {
    if (!selectedAsset) return;
    
    if (currentAssetType === 'stocks') {
        sellStocks();
    } else if (currentAssetType === 'realestate') {
        sellRealEstate();
    } else if (currentAssetType === 'business') {
        sellBusiness();
    } else if (currentAssetType === 'preciousmetals') {
        sellPreciousMetals();
    } else if (currentAssetType === 'misc') {
        sellMisc();
    }
}

// Продажа акций
function sellStocks() {
    const quantity = parseInt(document.querySelector('.sell-quantity').value) || 0;
    const sellPrice = parseFloat(document.querySelector('.sell-price').value) || 0;
    
    if (!selectedAsset) {
        alert('Выберите актив для продажи!');
        return;
    }
    
    if (quantity <= 0 || quantity > selectedAsset.quantity) {
        alert('Введите корректное количество!');
        return;
    }
    
    // Рассчитываем сумму продажи используя цену продажи
    const totalSale = quantity * sellPrice;
    
    // Убираем подтверждение для быстрого UX
    
    // Добавляем деньги от продажи
    window.cash += totalSale;
    
    // Добавляем запись в историю
    if (!window.data.history) window.data.history = [];
    window.data.history.push({
        type: 'sell',
        assetName: selectedAsset.name,
        amount: totalSale,
        quantity: quantity,
        date: new Date().toISOString()
    });
    
    // Обновляем количество акций или удаляем их полностью
    if (quantity === selectedAsset.quantity) {
        // Удаляем все акции этого типа
        window.data.asset = window.data.asset.filter(asset => 
            !(asset.type === 'stocks' && asset.name === selectedAsset.name)
        );
        
        // Если это дивидендная акция, обновляем пассивный доход
        if (['2BIGPOWER', 'CD'].includes(selectedAsset.name)) {
            const income = window.data.income.find(inc => inc.source === selectedAsset.name && inc.type === 'passive');

            if (income) {
                const dividendPerShare = selectedAsset.name === '2BIGPOWER' ? 10 : (selectedAsset.name === 'CD' ? 20 : 0);
                const incomeToRemove = quantity * dividendPerShare;
                income.value -= incomeToRemove;

                if (income.value <= 0) {
                    window.data.income = window.data.income.filter(inc => inc.id !== income.id);
                }
            }
        }
    } else {
        // Уменьшаем количество акций в группированной позиции
        const asset = window.data.asset.find(a => a.type === 'stocks' && a.name === selectedAsset.name);
        if (asset) {
            asset.quantity -= quantity;
            
            // Если это дивидендная акция, обновляем пассивный доход
            if (['2BIGPOWER', 'CD'].includes(selectedAsset.name)) {
                const income = window.data.income.find(inc => inc.source === selectedAsset.name && inc.type === 'passive');

                if (income) {
                    const dividendPerShare = selectedAsset.name === '2BIGPOWER' ? 10 : (selectedAsset.name === 'CD' ? 20 : 0);
                    const incomeToRemove = quantity * dividendPerShare;
                    income.value -= incomeToRemove;
                }
            }
        }
    }
    
    // Обновляем отображение
    window.renderCash();
    window.renderAll();
    window.renderIncome();
    window.renderSummary();
    window.renderHistory();
    autoSave();
    
    // Закрываем модальное окно
    closeSellStockModal();
}

// Продажа недвижимости
function sellRealEstate() {
    const sellPrice = parseFloat(sellRealEstatePriceInput.value) || 0;
    
    if (sellPrice < 0) {
        alert('Цена продажи не может быть отрицательной!');
        return;
    }
    
    // Убираем подтверждение для быстрого UX
    
    // Обновляем наличные только если цена больше 0
    if (sellPrice > 0) {
        window.cash = (parseFloat(window.cash) || 0) + sellPrice;
    }
    
    // Удаляем недвижимость из списка активов
    window.data.asset = window.data.asset.filter(asset => 
        asset.id !== selectedAsset.id
    );
    
    // Удаляем связанный пассивный доход
    window.data.income = window.data.income.filter(income => 
        !(income.type === 'passive' && income.source === selectedAsset.name)
    );
    
    // Удаляем связанные пассивы (ипотеку)
    // Ищем ипотеку по части ID актива (до временной метки)
    const assetBaseId = selectedAsset.id.split('-').slice(0, -1).join('-');
    window.data.liability = window.data.liability.filter(liability => 
        !(liability.type === 'mortgage' && liability.id.includes(assetBaseId))
    );

    // Добавляем запись в историю
    if (!window.data.history) window.data.history = [];
    window.data.history.push({
        type: 'sell',
        assetName: selectedAsset.name,
        amount: sellPrice,
        date: new Date().toISOString()
    });
    
    // Обновляем отображение
    window.renderCash();
    window.renderAll();
    window.renderIncome();
    window.renderLiability();
    window.renderSummary();
    window.renderHistory();
    autoSave();
    
    // Закрываем модальное окно
    closeSellStockModal();
}

// Продажа бизнеса
function sellBusiness() {
    if (!selectedAsset || currentAssetType !== 'business') return;
    
    const sellPrice = parseFloat(sellBusinessPriceInput.value) || 0;
    if (sellPrice < 0) {
        alert('Цена продажи не может быть отрицательной!');
        return;
    }
    
    // Убираем подтверждение для быстрого UX
    
    // Обновляем наличные только если цена больше 0
    if (sellPrice > 0) {
        window.cash = (parseFloat(window.cash) || 0) + sellPrice;
    }
    
    // Удаляем бизнес из списка активов
    window.data.asset = window.data.asset.filter(asset => 
        asset.id !== selectedAsset.id
    );
    
    // Удаляем связанный пассивный доход
    window.data.income = window.data.income.filter(income => 
        !(income.type === 'passive' && income.source === selectedAsset.name)
    );
    
    // Добавляем запись в историю
    if (!window.data.history) window.data.history = [];
    window.data.history.push({
        type: 'sell',
        assetName: selectedAsset.name,
        amount: sellPrice,
        date: new Date().toISOString()
    });
    
    // Обновляем отображение
    window.renderCash();
    window.renderAll();
    window.renderIncome();
    window.renderSummary();
    window.renderHistory();
    autoSave();
    
    // Закрываем модальное окно
    closeSellStockModal();
}

// Продажа драгметаллов
function sellPreciousMetals() {
    if (!selectedAsset || currentAssetType !== 'preciousmetals') return;
    
    const sellPrice = parseFloat(sellPreciousMetalsPriceInput.value) || 0;
    if (sellPrice < 0) return;
    
    // Убираем подтверждение для быстрого UX
    
    // Удаляем металл из активов
    window.data.asset = window.data.asset.filter(asset => 
        asset.id !== selectedAsset.id
    );
    
    // Добавляем деньги от продажи только если цена больше 0
    if (sellPrice > 0) {
        window.cash += sellPrice;
    }
    
    // Добавляем запись в историю
    if (!window.data.history) window.data.history = [];
    window.data.history.push({
        type: 'sell',
        assetName: selectedAsset.name,
        amount: sellPrice,
        date: new Date().toISOString()
    });
    
    // Обновляем отображение
    window.renderAll();
    window.renderCash();
    window.renderSummary();
    window.renderHistory();
    autoSave();
    
    // Закрываем модальное окно
    closeSellStockModal();
}

// Продажа всякой всячины
function sellMisc() {
    if (!selectedAsset || currentAssetType !== 'misc') return;
    
    const sellPrice = parseFloat(sellMiscPriceInput.value) || 0;
    if (sellPrice < 0) return;
    
    // Убираем подтверждение для быстрого UX
    
    // Находим связанный расход до удаления актива
    const relatedExpense = window.data.expense ? window.data.expense.find(exp => 
        exp.name === `Обслуживание: ${selectedAsset.name}`
    ) : null;
    
    // Удаляем предмет из активов
    window.data.asset = window.data.asset.filter(asset => 
        asset.id !== selectedAsset.id
    );
    
    // Удаляем связанный пассив если есть
    if (window.data.liability) {
        window.data.liability = window.data.liability.filter(liability => 
            liability.id !== `misc-debt-${selectedAsset.id}`
        );
    }
    
    // Удаляем связанный расход если есть
    if (window.data.expense && relatedExpense) {
        window.data.expense = window.data.expense.filter(expense => 
            expense.name !== `Обслуживание: ${selectedAsset.name}`
        );
    }
    
    // Добавляем деньги от продажи только если цена больше 0
    if (sellPrice > 0) {
        window.cash += sellPrice;
    }

    // Добавляем запись в историю
    if (!window.data.history) window.data.history = [];
    window.data.history.push({
        type: 'sell',
        assetName: selectedAsset.name,
        amount: sellPrice,
        date: new Date().toISOString()
    });
    
    // Закрываем модальное окно
    closeSellStockModal();
    
    // Обновляем все отображения в правильном порядке
    window.renderAll(); // Обновляем список активов
    window.renderExpenses(); // Обновляем список расходов
    window.renderLiability(); // Обновляем список пассивов
    window.renderCash(); // Обновляем отображение наличных
    window.renderSummary(); // Обновляем финансовую формулу
    window.renderHistory(); // Обновляем историю
    autoSave(); // Сохраняем изменения
    
    // Принудительно обновляем отображение главного экрана и скрываем остальные
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    const cashflowScreen = document.getElementById('screen-cashflow');
    if (cashflowScreen) {
        cashflowScreen.style.display = 'block';
    }
    
    // Обновляем активную кнопку навигации
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.nav-item[data-section="cashflow"]').classList.add('active');
}

// Обновление всех отображений
function updateDisplay() {
    window.renderAll();
    window.renderIncome();
    window.renderLiability();
    window.renderCash();
    window.renderSummary();
    window.renderHistory();
    closeSellStockModal();
}

// Функция для настройки числового поля ввода
function setupNumericInput(input) {
    if (!input) return;
    
    // Устанавливаем тип клавиатуры для числовых полей
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('pattern', '[0-9]*');
    
    // Добавляем обработчик события input для мгновенного обновления значения
    input.addEventListener('input', function(e) {
        // Удаляем все нецифровые символы
        let value = e.target.value.replace(/[^0-9]/g, '');
        
        // Обновляем значение поля
        e.target.value = value;
        
        // Принудительно обновляем отображение
        input.blur();
        input.focus();
        
        // Вызываем соответствующую функцию обновления расчетов
        if (currentAssetType === 'stocks') {
            updateSellCalculations();
        } else if (currentAssetType === 'realestate') {
            updateRealEstateSellCalculations();
        } else if (currentAssetType === 'business') {
            updateBusinessSellCalculations();
        } else if (currentAssetType === 'preciousmetals') {
            updatePreciousMetalsSellCalculations();
        } else if (currentAssetType === 'misc') {
            updateMiscSellCalculations();
        }
    });
    
    // Автоматически скрываем клавиатуру при нажатии Enter
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            input.blur();
        }
    });
}

// Функция для настройки всех числовых полей в форме
function setupAllNumericInputs() {
    // Настраиваем поле количества акций
    setupNumericInput(document.querySelector('.sell-quantity'));
    
    // Настраиваем поля цен для разных типов активов
    setupNumericInput(sellPriceInput);
    setupNumericInput(sellRealEstatePriceInput);
    setupNumericInput(sellBusinessPriceInput);
    setupNumericInput(sellPreciousMetalsPriceInput);
    setupNumericInput(sellMiscPriceInput);
}

// AssetManager теперь управляет всем интерфейсом продажи
// Старые обработчики удалены - используется новый AssetManager

// AssetManager теперь управляет кнопкой "Продать"
// Старый обработчик удален - используется новый в AssetManager.js

// === ОТРИСОВКА ФИНАНСОВОЙ ФОРМУЛЫ ===
const originalRenderSummary = function() {
    // Получаем элементы для отображения
    var salaryElement = document.getElementById('salary-value');
    var passiveIncomeElement = document.getElementById('passive-value');
    var totalIncomeElement = document.getElementById('income-sum');
    var totalExpenseElement = document.getElementById('expense-sum');
    var cashFlowElement = document.getElementById('cashflow');

    // Инициализируем значения
    let salary = window.data.job ? window.data.job.salary : 0;
    let passiveIncome = 0;
    let totalExpense = 0;
    
    // Считаем пассивный доход
    if (window.data && Array.isArray(window.data.income)) {
        window.data.income.forEach(function(inc) {
            const value = Number(inc.value) || 0;
            if (inc.type === 'passive') {
                passiveIncome += value;
            }
        });
    }

    // Рассчитываем общий доход (зарплата + пассивный доход)
    const totalIncome = salary + passiveIncome;

    // Рассчитываем налог (25% от положительных доходов)
    const taxRate = 0.25;
    const taxableIncome = Math.max(0, totalIncome);
    const tax = Math.round(taxableIncome * taxRate);

    // Обновляем или создаем запись о налогах в расходах
    if (window.data && Array.isArray(window.data.expense)) {
        const taxExpenseIndex = window.data.expense.findIndex(exp => exp.name === 'Налоги (25%)');
        if (taxExpenseIndex !== -1) {
            window.data.expense[taxExpenseIndex].value = tax;
        } else {
            window.data.expense.push({
                name: 'Налоги (25%)',
                value: tax,
                type: 'tax'
            });
        }

        // Считаем общие расходы (включая налоги)
        totalExpense = window.data.expense.reduce(function(sum, exp) {
            return sum + (Number(exp.value) || 0);
        }, 0);
    }

    // Рассчитываем денежный поток (общий доход - общий расход, включая налоги)
    const cashFlow = totalIncome - totalExpense;

    // Отображаем все значения
    if (salaryElement) salaryElement.textContent = salary;
    if (passiveIncomeElement) passiveIncomeElement.textContent = passiveIncome;
    if (totalIncomeElement) totalIncomeElement.textContent = totalIncome;
    if (totalExpenseElement) totalExpenseElement.textContent = totalExpense;
    if (cashFlowElement) cashFlowElement.textContent = cashFlow;

    // Устанавливаем цвета для значений
    if (passiveIncomeElement) {
        passiveIncomeElement.style.color = passiveIncome >= 0 ? 'black' : 'red';
    }
    if (totalIncomeElement) {
        totalIncomeElement.style.color = totalIncome >= 0 ? 'black' : 'red';
    }
    if (cashFlowElement) {
        cashFlowElement.style.color = cashFlow >= 0 ? 'green' : 'red';
    }
};

// Оборачиваем функцию в автосохранение
window.renderSummary = function(...args) {
    originalRenderSummary.apply(this, args);
    // Добавляем обновление списка расходов после расчета налогов
    if (typeof window.renderExpenses === 'function') {
        window.renderExpenses();
    }
    if (typeof window.autoSave === 'function') {
        window.autoSave();
    }
};

// Функция обновления списка расходов
window.renderExpenses = function() {
    const expenseList = document.getElementById('expense-list');
    if (!expenseList) return;

    expenseList.innerHTML = '';
    const expenses = window.data.expense || [];

    expenses.forEach(expense => {
        const expenseItem = document.createElement('li');
        expenseItem.className = 'item';
        expenseItem.innerHTML = `
            <span class="item-name">${expense.name}</span>
            <span class="item-amount">$${expense.value}</span>
        `;
        expenseList.appendChild(expenseItem);
    });

    // Обновляем общую сумму расходов
    const expenseTotal = document.getElementById('expense-total');
    if (expenseTotal) {
        const total = expenses.reduce((sum, expense) => sum + (Number(expense.value) || 0), 0);
        expenseTotal.textContent = total;
    }
};

// Функция обновления суммы расходов в финансовой формуле
window.updateExpenseSum = function() {
    const expenseSum = document.getElementById('expense-sum');
    if (!expenseSum) return;

    const expenses = window.data.expense || [];
    const total = expenses.reduce((sum, expense) => sum + (Number(expense.value) || 0), 0);
    expenseSum.textContent = total;

    // Обновляем поток денег
    const incomeSum = parseInt(document.getElementById('income-sum').textContent) || 0;
    const cashflow = document.getElementById('cashflow');
    if (cashflow) {
        cashflow.textContent = incomeSum - total;
    }
};

// В начало файла, после объявления переменных
let paydayBtn = document.getElementById('payday-btn');
let monthsCounter = document.getElementById('months-counter');

// Функция обработки PayDay
function handlePayDay() {
    // Сначала обновляем все компоненты формулы и получаем актуальные значения
    window.renderSummary();
    
    // Получаем уже рассчитанные значения из элементов интерфейса
    const salary = parseInt(document.getElementById('salary-value').textContent) || 0;
    const passiveIncome = parseInt(document.getElementById('passive-value').textContent) || 0;
    const totalExpenses = parseInt(document.getElementById('expense-sum').textContent) || 0;
    const cashFlow = parseInt(document.getElementById('cashflow').textContent) || 0;
    
    // Создаем запись для истории
    const historyEntry = {
        date: new Date().toISOString(),
        type: 'payday',
        amount: cashFlow,
        monthNumber: (window.data.monthsCount || 0) + 1
    };
    
    // Обновляем баланс, используя уже рассчитанный cashFlow
    window.cash = (parseFloat(window.cash) || 0) + cashFlow;
    
    // Увеличиваем счетчик месяцев
    window.data.monthsCount = (window.data.monthsCount || 0) + 1;
    
    // Добавляем запись в историю
    if (!window.data.history) window.data.history = [];
    window.data.history.push(historyEntry);
    
    // Обновляем отображение счетчика месяцев
    const monthsCounter = document.getElementById('months-counter');
    if (monthsCounter) {
        monthsCounter.textContent = window.data.monthsCount;
    }
    
    // Обновляем отображение
    window.renderCash();
    window.renderHistory();
    
    // Показываем уведомление
    const sign = cashFlow >= 0 ? '+' : '';
    alert(`Месяц ${window.data.monthsCount}\nДенежный поток: ${sign}$${cashFlow}\nНовый баланс: $${window.cash}`);
    
    // Сохраняем изменения
    if (typeof window.autoSave === 'function') {
        window.autoSave();
    }
}

// В функцию window.loadData добавляем инициализацию счетчика месяцев
const originalLoadData = window.loadData;
window.loadData = function() {
    originalLoadData.apply(this, arguments);
    
    // Инициализируем счетчик месяцев
    if (typeof window.data.monthsCount === 'undefined') {
        window.data.monthsCount = 0;
    }
    monthsCounter.textContent = window.data.monthsCount;
};

// В функцию window.resetGame добавляем сброс счетчика месяцев
window.resetGame = function() {
    if (!confirm('Вы уверены, что хотите начать новую игру? Все текущие данные будут удалены!')) {
        return;
    }
    
    // Полностью очищаем все данные
    window.data = {
        income: [],
        expense: [],
        asset: [],
        liability: [],
        children: [],
        history: [],
        monthsCount: 0
    };
    window.cash = 0;
    
    // Тщательная очистка localStorage
    localStorage.clear();
    localStorage.removeItem('appData');
    localStorage.removeItem('cash');
    localStorage.removeItem('data');
    
    // Сохраняем пустые данные в localStorage
    localStorage.setItem('appData', JSON.stringify(window.data));
    localStorage.setItem('cash', '0');
    
    // Очищаем все возможные кэши
    if (window.sessionStorage) {
        sessionStorage.clear();
    }
    
    // Показываем сообщение
    alert('Игра успешно сброшена. Страница будет перезагружена.');
    
    // Принудительно перезагружаем страницу без использования кэша
    window.location.href = window.location.href + '?nocache=' + new Date().getTime();
};

// Добавляем обработчик для кнопки PayDay
document.addEventListener('DOMContentLoaded', function() {
    paydayBtn = document.getElementById('payday-btn');
    monthsCounter = document.getElementById('months-counter');
    
    if (paydayBtn) {
        paydayBtn.addEventListener('click', handlePayDay);
    }
});

// Функция форматирования даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Функция отображения истории операций
window.renderHistory = function() {
    const historyContainer = document.getElementById('history-container');
    if (!historyContainer) return;

    // Принудительно очищаем контейнер
    historyContainer.innerHTML = '';

    // Проверяем наличие истории
    if (!window.data || !window.data.history || window.data.history.length === 0) {
        historyContainer.innerHTML = '<div class="history-empty">История операций пуста</div>';
        return;
    }

    // Получаем историю и сортируем по дате (новые сверху)
    const history = window.data.history.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    // Создаем HTML для каждой операции
    const historyHTML = history.map(entry => {
        let typeText = '';
        let amountText = '';
        let colorClass = '';
        let quantityText = entry.quantity ? ` (${entry.quantity} шт.)` : '';

        switch (entry.type) {
            case 'payday':
                typeText = `PayDay (Месяц ${entry.monthNumber})`;
                colorClass = entry.amount >= 0 ? 'positive' : 'negative';
                amountText = `${entry.amount >= 0 ? '+' : ''}$${entry.amount}`;
                break;
            case 'buy':
                typeText = `Покупка: ${entry.assetName}${quantityText}`;
                colorClass = 'negative';
                amountText = `-$${entry.amount}`;
                break;
            case 'sell':
                typeText = `Продажа: ${entry.assetName}${quantityText}`;
                colorClass = 'positive';
                amountText = `+$${entry.amount}`;
                break;
            case 'loan':
                typeText = `Получение кредита`;
                colorClass = 'positive';
                amountText = `+$${entry.amount}`;
                break;
            case 'loan_repayment':
                typeText = `Погашение кредита`;
                colorClass = 'negative';
                amountText = `-$${entry.amount}`;
                break;
            case 'tax':
                typeText = 'Налоги';
                colorClass = 'negative';
                amountText = `-$${entry.amount}`;
                break;
            case 'income':
                typeText = `Доход: ${entry.description || 'Без описания'}`;
                colorClass = 'positive';
                amountText = `+$${entry.amount}`;
                break;
            case 'expense':
                typeText = `Расход: ${entry.description || 'Без описания'}`;
                colorClass = 'negative';
                amountText = `-$${entry.amount}`;
                break;
            case 'job':
                typeText = 'ПРОШЕЛ собеседование';
                colorClass = 'positive';
                amountText = `$${entry.salary}/мес`;
                break;
            case 'new_job':
                typeText = `Устроился на работу: ${entry.title}`;
                colorClass = 'positive';
                amountText = `$${entry.salary}/мес`;
                break;
            case 'quit_job':
                typeText = `Уволился с работы: ${entry.jobTitle}`;
                colorClass = 'negative';
                amountText = `-$${entry.salary}/мес`;
                break;
            case 'take':
                typeText = `Получение денег: ${entry.description}`;
                colorClass = 'positive';
                amountText = `+$${entry.amount}`;
                break;
            case 'give':
                typeText = `Передача денег: ${entry.description}`;
                colorClass = 'negative';
                amountText = `-$${entry.amount}`;
                break;
            case 'add_child':
                typeText = `Добавлен ребенок: ${entry.childName}`;
                colorClass = 'negative';
                amountText = `-$${entry.expense}/мес`;
                break;
            case 'remove_child':
                typeText = `Удален ребенок: ${entry.childName}`;
                colorClass = 'neutral';
                amountText = '';
                break;
            default:
                typeText = 'Операция';
                amountText = `$${entry.amount}`;
        }

        return `
            <div class="history-item ${colorClass}">
                <div class="history-date">${formatDate(entry.date)}</div>
                <div class="history-info">
                    <div class="history-type">${typeText}</div>
                    <div class="history-amount">${amountText}</div>
                </div>
            </div>
        `.trim();
    }).join('');

    historyContainer.innerHTML = historyHTML;
};

// Функция погашения кредита
function repayLoan(loanId) {
    // Находим кредит по ID
    const loan = window.data.liability.find(l => l.id === loanId);
    if (!loan || loan.type !== 'loan') {
        alert('Кредит не найден!');
        return;
    }

    // Запрашиваем сумму погашения
    let repayAmount = prompt(`Введите сумму для погашения кредита (кратно 1000).\nТекущий остаток: $${loan.value}`);
    repayAmount = parseInt(repayAmount);

    // Проверяем корректность введенной суммы
    if (isNaN(repayAmount) || repayAmount <= 0) {
        alert('Введите корректную сумму!');
        return;
    }

    // Проверяем кратность 1000
    if (repayAmount % 1000 !== 0) {
        alert('Сумма погашения должна быть кратна 1000!');
        return;
    }

    // Проверяем, не превышает ли сумма погашения остаток по кредиту
    if (repayAmount > loan.value) {
        alert('Сумма погашения не может превышать остаток по кредиту!');
        return;
    }

    // Проверяем достаточно ли денег
    if (repayAmount > window.cash) {
        alert('Недостаточно денег для погашения!');
        return;
    }

    // Подтверждение операции
    if (!confirm(`Вы уверены, что хотите погасить кредит на сумму $${repayAmount}?`)) {
        return;
    }

    // Уменьшаем сумму кредита
    loan.value -= repayAmount;

    // Уменьшаем ежемесячный платеж пропорционально
    const monthlyPaymentExpense = window.data.expense.find(e => 
        e.type === 'loan' && e.name.includes(loan.name.replace('Кредит: ', ''))
    );
    if (monthlyPaymentExpense) {
        monthlyPaymentExpense.value = Math.round(loan.value * 0.1);
    }

    // Уменьшаем наличные
    window.cash -= repayAmount;

    // Если кредит полностью погашен, удаляем его и связанный расход
    if (loan.value === 0) {
        window.data.liability = window.data.liability.filter(l => l.id !== loanId);
        window.data.expense = window.data.expense.filter(e => 
            !(e.type === 'loan' && e.name.includes(loan.name.replace('Кредит: ', '')))
        );
    }

    // Добавляем запись в историю
    if (!window.data.history) window.data.history = [];
    window.data.history.push({
        type: 'loan_repayment',
        amount: repayAmount,
        date: new Date().toISOString(),
        description: `Погашение кредита на сумму $${repayAmount}`
    });

    // Обновляем отображение
    window.renderCash();
    window.renderLiability();
    window.renderExpenses();
    window.renderSummary();
    window.renderHistory();
    autoSave();

    // Показываем сообщение об успешной операции
    alert(`Кредит успешно погашен на сумму $${repayAmount}${loan.value > 0 ? `\nОстаток по кредиту: $${loan.value}` : '\nКредит полностью погашен!'}`);
}

// Функция для форматирования числа
function formatNumber(num) {
    if (num === null || num === undefined) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Обновляем функцию renderLiability
window.renderLiability = function() {
    const liabilityList = document.getElementById('liability-list');
    if (!liabilityList) return;

    // Очищаем список
    liabilityList.innerHTML = '';
    
    // Проверяем наличие массива пассивов
    if (!window.data.liability) {
        window.data.liability = [];
    }

    // Вычисляем общую сумму пассивов и отдельно сумму кредитов
    let totalLiabilities = 0;
    let totalLoans = 0;

    // Сначала добавляем общую сумму кредитов, если они есть
    const loans = window.data.liability.filter(l => l.type === 'loan');
    if (loans.length > 0) {
        totalLoans = loans.reduce((sum, loan) => sum + (parseFloat(loan.value) || 0), 0);
        if (totalLoans > 0) {
            const loanSummaryItem = document.createElement('li');
            loanSummaryItem.className = 'item loan-summary';
            loanSummaryItem.innerHTML = `
                <span class="item-name">Общая сумма кредитов</span>
                <span class="item-amount">$${formatNumber(totalLoans)}</span>
            `;
            liabilityList.appendChild(loanSummaryItem);
        }
    }

    // Затем добавляем все пассивы
    window.data.liability.forEach(liability => {
        const value = parseFloat(liability.value) || 0;
        totalLiabilities += value;
        
        const liabilityItem = document.createElement('li');
        liabilityItem.className = 'item';
        
        liabilityItem.innerHTML = `
            <span class="item-name">${liability.name}</span>
            <span class="item-amount">$${formatNumber(value)}</span>
        `;
        liabilityList.appendChild(liabilityItem);
    });

    // Обновляем итоговую сумму
    const totalElement = document.getElementById('liability-total');
    if (totalElement) {
        totalElement.textContent = formatNumber(totalLiabilities);
    }

    // Обновляем отображение кредита в заголовке
    const creditDisplay = document.querySelector('.credit-display');
    if (creditDisplay) {
        creditDisplay.textContent = `Кредит: $${formatNumber(totalLoans)}`;
    }

    // Обновляем состояние кнопки погашения кредита
    updateRepayLoanButton();
};

// Функция обновления кнопки погашения кредита
function updateRepayLoanButton() {
    const actionModal = document.getElementById('action-modal');
    if (!actionModal) return;

    // Находим контейнер для контента модального окна
    const modalContent = actionModal.querySelector('.modal-content');
    if (!modalContent) return;

    // Проверяем наличие кредита
    const hasLoan = window.data.liability && window.data.liability.some(l => l.type === 'loan');

    // Находим или создаем секцию для кнопок кредита
    let loanSection = modalContent.querySelector('.loan-section');
    if (!loanSection && hasLoan) {
        loanSection = document.createElement('div');
        loanSection.className = 'loan-section action-section';
        
        // Добавляем заголовок секции
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'section-title';
        sectionTitle.innerHTML = '<i class="fas fa-money-bill-wave"></i>';
        loanSection.appendChild(sectionTitle);
        
        // Создаем кнопку погашения
        const repayButton = document.createElement('button');
        repayButton.id = 'repay-loan-btn';
        repayButton.className = 'btn btn-primary repay-loan-btn';
        repayButton.textContent = 'Погасить кредит';
        
        // Добавляем обработчик клика
        repayButton.addEventListener('click', () => {
            const loan = window.data.liability.find(l => l.type === 'loan');
            if (loan) {
                repayLoan(loan.id);
            }
        });
        
        loanSection.appendChild(repayButton);
        
        // Добавляем секцию в начало модального окна
        modalContent.insertBefore(loanSection, modalContent.firstChild);
    } else if (loanSection) {
        // Если секция существует, показываем или скрываем её в зависимости от наличия кредита
        loanSection.style.display = hasLoan ? 'block' : 'none';
    }
}

// Добавляем обработчик для открытия модального окна действий
document.addEventListener('DOMContentLoaded', function() {
    const actionButton = document.querySelector('[data-target="#action-modal"]');
    if (actionButton) {
        actionButton.addEventListener('click', function() {
            // Обновляем состояние кнопки погашения кредита при открытии модального окна
            setTimeout(updateRepayLoanButton, 100);
        });
    }
    
    // Также обновляем при первоначальной загрузке
    updateRepayLoanButton();
});

// Функция сохранения данных
window.autoSave = function() {
    // Убедимся, что у нас есть объект data
    if (!window.data) {
        window.data = {
            income: [],
            expense: [],
            asset: [],
            liability: [],
            history: [],
            monthsCount: 0
        };
    }

    // Сохраняем все данные
    localStorage.setItem('appData', JSON.stringify(window.data));
    localStorage.setItem('cash', window.cash.toString());
};

// Функция загрузки данных
window.loadData = function() {
    try {
        // Загружаем данные из localStorage
        const savedData = localStorage.getItem('appData');
        const savedCash = localStorage.getItem('cash');

        if (savedData) {
            window.data = JSON.parse(savedData);
            
            // Проверяем и инициализируем все необходимые массивы
            window.data.income = window.data.income || [];
            window.data.expense = window.data.expense || [];
            window.data.asset = window.data.asset || [];
            window.data.liability = window.data.liability || [];
            window.data.history = window.data.history || [];
            window.data.monthsCount = window.data.monthsCount || 0;
        } else {
            // Если данных нет, создаем пустую структуру
            window.data = {
                income: [],
                expense: [],
                asset: [],
                liability: [],
                history: [],
                monthsCount: 0
            };
        }

        // Загружаем наличные
        window.cash = parseFloat(savedCash) || 0;

        // Обновляем все отображения
        window.renderAll();
        window.renderIncome();
        window.renderLiability();
        window.renderExpenses();
        window.renderCash();
        window.renderSummary();
        window.renderHistory();

        // Обновляем счетчик месяцев
        const monthsCounter = document.getElementById('months-counter');
        if (monthsCounter) {
            monthsCounter.textContent = window.data.monthsCount;
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        alert('Произошла ошибка при загрузке данных. Данные будут сброшены.');
        window.resetGame();
    }
};

// Обновляем функцию renderLiability
window.renderLiability = function() {
    const liabilityList = document.getElementById('liability-list');
    if (!liabilityList) return;

    // Очищаем список
    liabilityList.innerHTML = '';
    
    // Проверяем наличие массива пассивов
    if (!window.data.liability) {
        window.data.liability = [];
    }

    // Вычисляем общую сумму пассивов и отдельно сумму кредитов
    let totalLiabilities = 0;
    let totalLoans = 0;

    // Сначала добавляем общую сумму кредитов, если они есть
    const loans = window.data.liability.filter(l => l.type === 'loan');
    if (loans.length > 0) {
        totalLoans = loans.reduce((sum, loan) => sum + (parseFloat(loan.value) || 0), 0);
        if (totalLoans > 0) {
            const loanSummaryItem = document.createElement('li');
            loanSummaryItem.className = 'item loan-summary';
            loanSummaryItem.innerHTML = `
                <span class="item-name">Общая сумма кредитов</span>
                <span class="item-amount">$${formatNumber(totalLoans)}</span>
            `;
            liabilityList.appendChild(loanSummaryItem);
        }
    }

    // Затем добавляем все пассивы
    window.data.liability.forEach(liability => {
        const value = parseFloat(liability.value) || 0;
        totalLiabilities += value;
        
        const liabilityItem = document.createElement('li');
        liabilityItem.className = 'item';
        
        liabilityItem.innerHTML = `
            <span class="item-name">${liability.name}</span>
            <span class="item-amount">$${formatNumber(value)}</span>
        `;
        liabilityList.appendChild(liabilityItem);
    });

    // Обновляем итоговую сумму
    const totalElement = document.getElementById('liability-total');
    if (totalElement) {
        totalElement.textContent = formatNumber(totalLiabilities);
    }

    // Обновляем отображение кредита в заголовке
    const creditDisplay = document.querySelector('.credit-display');
    if (creditDisplay) {
        creditDisplay.textContent = `Кредит: $${formatNumber(totalLoans)}`;
    }

    // Обновляем состояние кнопки погашения кредита
    updateRepayLoanButton();
};

// Функция обновления кнопки погашения кредита
function updateRepayLoanButton() {
    const actionModal = document.getElementById('action-modal');
    if (!actionModal) return;

    // Находим контейнер для контента модального окна
    const modalContent = actionModal.querySelector('.modal-content');
    if (!modalContent) return;

    // Проверяем наличие кредита
    const hasLoan = window.data.liability && window.data.liability.some(l => l.type === 'loan');

    // Находим или создаем секцию для кнопок кредита
    let loanSection = modalContent.querySelector('.loan-section');
    if (!loanSection && hasLoan) {
        loanSection = document.createElement('div');
        loanSection.className = 'loan-section action-section';
        
        // Добавляем заголовок секции
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'section-title';
        sectionTitle.innerHTML = '<i class="fas fa-money-bill-wave"></i>';
        loanSection.appendChild(sectionTitle);
        
        // Создаем кнопку погашения
        const repayButton = document.createElement('button');
        repayButton.id = 'repay-loan-btn';
        repayButton.className = 'btn btn-primary repay-loan-btn';
        repayButton.textContent = 'Погасить кредит';
        
        // Добавляем обработчик клика
        repayButton.addEventListener('click', () => {
            const loan = window.data.liability.find(l => l.type === 'loan');
            if (loan) {
                repayLoan(loan.id);
            }
        });
        
        loanSection.appendChild(repayButton);
        
        // Добавляем секцию в начало модального окна
        modalContent.insertBefore(loanSection, modalContent.firstChild);
    } else if (loanSection) {
        // Если секция существует, показываем или скрываем её в зависимости от наличия кредита
        loanSection.style.display = hasLoan ? 'block' : 'none';
    }
}

// Добавляем обработчик для открытия модального окна действий
document.addEventListener('DOMContentLoaded', function() {
    const actionButton = document.querySelector('[data-target="#action-modal"]');
    if (actionButton) {
        actionButton.addEventListener('click', function() {
            // Обновляем состояние кнопки погашения кредита при открытии модального окна
            setTimeout(updateRepayLoanButton, 100);
        });
    }
    
    // Также обновляем при первоначальной загрузке
    updateRepayLoanButton();
}); 

// Функция инициализации кнопок быстрых цен для продажи акций
function initializeSellPriceButtons(stockName) {
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
            const sellPriceInput = document.querySelector('.sell-price');
            
            // Убираем активное состояние со всех кнопок
            document.querySelectorAll('.quick-sell-price-btn').forEach(b => b.classList.remove('active'));
            
            // Добавляем активное состояние к нажатой кнопке
            this.classList.add('active');
            
            // Устанавливаем цену в поле ввода
            sellPriceInput.value = price;
            
            // Запускаем расчет
            updateSellCalculations();
        });
    });
} 