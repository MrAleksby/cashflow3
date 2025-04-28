// Обработка навигации
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
const selectedStockInfo = document.getElementById('selected-stock-info');
const selectedRealEstateInfo = document.getElementById('selected-realestate-info');
const sellPriceInput = document.querySelector('.sell-price');
const sellRealEstatePriceInput = document.querySelector('.sell-realestate-price');
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
        stockItem.innerHTML = `
            <span>${stock.name} (${stock.quantity} шт.)</span>
            <span>$${stock.price}/шт</span>
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

// Выбор актива для продажи
function selectAsset(asset, type) {
    selectedAsset = asset;
    document.querySelectorAll('.asset-item').forEach(item => item.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
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
        
        updateSellCalculations();
    } else {
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
    }
    
    sellAssetBtn.disabled = false;
}

// Обновление расчетов при продаже акций
function updateSellCalculations() {
    if (!selectedAsset || currentAssetType !== 'stocks') return;
    
    const quantity = parseInt(document.querySelector('.sell-quantity').value) || 0;
    const price = parseFloat(sellPriceInput.value) || 0;
    const total = quantity * price;
    
    document.querySelector('.sell-total').textContent = `$${total}`;
    sellAssetBtn.disabled = quantity <= 0 || price <= 0 || quantity > selectedAsset.quantity;
}

// Обновление расчетов при продаже недвижимости
function updateRealEstateSellCalculations() {
    if (!selectedAsset || currentAssetType !== 'realestate') return;
    
    const price = parseFloat(sellRealEstatePriceInput.value) || 0;
    document.querySelector('.sell-realestate-total').textContent = `$${price}`;
    sellAssetBtn.disabled = price <= 0;
}

// Продажа актива
function sellAsset() {
    if (!selectedAsset) return;
    
    if (currentAssetType === 'stocks') {
        sellStocks();
    } else {
        sellRealEstate();
    }
}

// Продажа акций
function sellStocks() {
    const quantity = parseInt(document.querySelector('.sell-quantity').value) || 0;
    const sellPrice = parseFloat(sellPriceInput.value) || 0;
    
    if (quantity <= 0 || sellPrice <= 0) {
        alert('Введите корректное количество и цену!');
        return;
    }
    
    if (quantity > selectedAsset.quantity) {
        alert('У вас нет столько акций!');
        return;
    }
    
    const totalAmount = sellPrice * quantity;
    
    // Подтверждение продажи
    if (!confirm(`Подтвердите продажу:\n${quantity} акций ${selectedAsset.name}\nЦена: $${sellPrice}/шт\nИтого: $${totalAmount}`)) {
        return;
    }
    
    // Обновляем наличные
    window.cash = (parseFloat(window.cash) || 0) + totalAmount;
    
    // Обновляем количество акций или удаляем их полностью
    if (quantity === selectedAsset.quantity) {
        // Удаляем акции из списка активов
        window.data.asset = window.data.asset.filter(asset => 
            asset.name !== selectedAsset.name
        );
        
        // Если это дивидендная акция, удаляем соответствующий пассивный доход
        if (['2BIGPOWER', 'CD'].includes(selectedAsset.name)) {
            window.data.income = window.data.income.filter(income => 
                !(income.name.startsWith('Денежный поток') && 
                  income.source === selectedAsset.name)
            );
        }
    } else {
        // Уменьшаем количество акций
        const asset = window.data.asset.find(a => a.name === selectedAsset.name);
        if (asset) {
            asset.quantity -= quantity;
            
            // Если это дивидендная акция, обновляем пассивный доход
            if (['2BIGPOWER', 'CD'].includes(selectedAsset.name)) {
                const income = window.data.income.find(inc => 
                    inc.name.startsWith('Денежный поток') && 
                    inc.source === selectedAsset.name
                );
                if (income) {
                    income.value = calculateDividends(selectedAsset.name, asset.quantity);
                }
            }
        }
    }
    
    updateDisplay();
}

// Продажа недвижимости
function sellRealEstate() {
    const sellPrice = parseFloat(sellRealEstatePriceInput.value) || 0;
    
    if (sellPrice < 0) {
        alert('Цена продажи не может быть отрицательной!');
        return;
    }
    
    // Подтверждение продажи
    const actionWord = sellPrice === 0 ? 'передачу' : 'продажу';
    const priceText = sellPrice === 0 ? '' : `\nЦена: $${sellPrice}`;
    if (!confirm(`Подтвердите ${actionWord}:\n${selectedAsset.name}${priceText}`)) {
        return;
    }
    
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
    
    updateDisplay();
}

// Обновление всех отображений
function updateDisplay() {
    window.renderAll();
    window.renderIncome();
    window.renderLiability();
    window.renderCash();
    window.renderSummary();
    closeSellStockModal();
}

// Инициализация интерфейса продажи
function initializeSellInterface() {
    // Добавляем обработчики для полей ввода акций
    const quantityInput = document.querySelector('.sell-quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', updateSellCalculations);
    }
    
    if (sellPriceInput) {
        sellPriceInput.addEventListener('input', updateSellCalculations);
    }
    
    // Добавляем обработчик для поля цены недвижимости
    if (sellRealEstatePriceInput) {
        sellRealEstatePriceInput.addEventListener('input', updateRealEstateSellCalculations);
    }
    
    // Добавляем обработчики для кнопок
    if (sellAssetBtn) {
        sellAssetBtn.addEventListener('click', sellAsset);
    }
    
    if (cancelSellBtn) {
        cancelSellBtn.addEventListener('click', closeSellStockModal);
    }
    
    // Добавляем обработчик для закрытия по клику на крестик
    const closeBtn = document.querySelector('#sell-modal .close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSellStockModal);
    }
    
    // Добавляем обработчики для кнопок выбора типа актива
    document.querySelectorAll('.asset-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentAssetType = btn.dataset.type;
            updateAssetTypeButtons();
            
            // Показываем соответствующий список
            if (currentAssetType === 'stocks') {
                stockList.style.display = 'block';
                realEstateList.style.display = 'none';
                loadStockList();
            } else {
                stockList.style.display = 'none';
                realEstateList.style.display = 'block';
                loadRealEstateList();
            }
            
            // Скрываем информацию о выбранном активе
            selectedStockInfo.style.display = 'none';
            selectedRealEstateInfo.style.display = 'none';
            sellAssetBtn.disabled = true;
        });
    });
}

// Вызываем инициализацию после загрузки страницы
document.addEventListener('DOMContentLoaded', initializeSellInterface);

// Добавляем обработчик для кнопки "Продать" в основном интерфейсе
document.getElementById('main-sell-btn').addEventListener('click', openSellStockModal);

// === ОТРИСОВКА ФИНАНСОВОЙ ФОРМУЛЫ ===
window.renderSummary = function() {
    // Получаем элементы для отображения
    var salaryElement = document.getElementById('salary-value');
    var passiveIncomeElement = document.getElementById('passive-value');
    var totalIncomeElement = document.getElementById('income-sum');
    var totalExpenseElement = document.getElementById('expense-sum');
    var cashFlowElement = document.getElementById('cashflow');

    // Инициализируем значения
    let salary = 0;
    let passiveIncome = 0;
    let totalExpense = 0;
    
    // Считаем зарплату и пассивный доход
    if (window.data && Array.isArray(window.data.income)) {
        window.data.income.forEach(function(inc) {
            const value = Number(inc.value) || 0;
            if (inc.type === 'passive') {
                // Добавляем в пассивный доход
                passiveIncome += value;
            } else {
                // Добавляем в зарплату
                salary += value;
            }
        });
    }

    // Считаем общие расходы
    if (window.data && Array.isArray(window.data.expense)) {
        totalExpense = window.data.expense.reduce(function(sum, exp) {
            return sum + (Number(exp.value) || 0);
        }, 0);
    }

    // Рассчитываем общий доход (зарплата + пассивный доход)
    const totalIncome = salary + passiveIncome;

    // Рассчитываем денежный поток (общий доход - общий расход)
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