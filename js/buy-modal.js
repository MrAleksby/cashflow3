// Категории активов и их содержимое
const ASSET_CATEGORIES = {
    stocks: {
        title: 'Акции',
        items: [
            {
                id: 'myt4u',
                name: 'MYT4U',
                type: 'speculative',
                description: 'Спекулятивные акции без пассивного дохода'
            },
            {
                id: 'on2u',
                name: 'ON2U',
                type: 'speculative',
                description: 'Спекулятивные акции без пассивного дохода'
            },
            {
                id: 'ok4u',
                name: 'OK4U',
                type: 'speculative',
                description: 'Спекулятивные акции без пассивного дохода'
            },
            {
                id: 'gro4us',
                name: 'GRO4US',
                type: 'speculative',
                description: 'Спекулятивные акции без пассивного дохода'
            },
            {
                id: '2bigpower',
                name: '2BIGPOWER',
                type: 'dividend',
                pricePerShare: 1200,
                fixedPrice: true,
                dividendType: 'fixed',
                dividendValue: 10,
                description: 'Стабильные акции с фиксированным доходом $10 в месяц'
            },
            {
                id: 'cd',
                name: 'CD',
                type: 'dividend',
                pricePerShare: 4000,
                alternativePrice: 5000,
                dividendType: 'fixed',
                dividendValue: 20,
                description: 'Акции с фиксированным месячным доходом $20'
            }
        ]
    },
    realestate: {
        title: 'Недвижимость',
        items: [
            {
                id: 'house-2-1',
                name: '2/1',
                type: 'house',
                description: '2 спальни, 1 ванная'
            },
            {
                id: 'house-3-2',
                name: '3/2',
                type: 'house',
                description: '3 спальни, 2 ванные'
            },
            {
                id: 'plex-2',
                name: '2 плекс',
                type: 'multiplex',
                description: 'Дуплекс'
            },
            {
                id: 'plex-4',
                name: '4 плекс',
                type: 'multiplex',
                description: '4 квартиры'
            },
            {
                id: 'plex-8',
                name: '8 плекс',
                type: 'multiplex',
                description: '8 квартир'
            },
            {
                id: 'plex-16',
                name: '16 плекс',
                type: 'multiplex',
                description: '16 квартир'
            },
            {
                id: 'land',
                name: 'Земля',
                type: 'land',
                description: 'Земельный участок'
            },
            {
                id: 'apartment-building',
                name: 'Многоквартирный дом',
                type: 'apartment',
                description: 'Многоквартирный жилой дом'
            }
        ]
    },
    business: {
        title: 'Бизнес',
        items: [
            {
                id: 'business1',
                name: 'Автомойка',
                price: 25000,
                monthlyIncome: 1500,
                description: 'Действующий бизнес'
            },
            {
                id: 'business2',
                name: 'Кофейня',
                price: 35000,
                monthlyIncome: 2000,
                description: 'Популярное место'
            }
        ]
    },
    preciousmetals: {
        title: 'Драгоценные металлы',
        items: [
            {
                id: 'krugerrand',
                name: 'Золотой Крюгерранд',
                type: 'gold',
                description: 'Южноафриканская золотая монета'
            },
            {
                id: 'rare-coin',
                name: 'Редкая золотая монета 16 века',
                type: 'collectible',
                description: 'Историческая золотая монета'
            }
        ]
    },
    misc: {
        title: 'Всякая всячина',
        items: []
    }
};

// Инициализация модального окна покупки
(function() {
    const modal = document.getElementById('buy-modal');
    const buyBtn = document.getElementById('main-buy-btn');
    const closeBtn = modal.querySelector('.close-btn');
    const categoryCards = modal.querySelectorAll('.category-card');

    // Обработчик выбора категории
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            showCategoryItems(category);
        });
    });

    // Создание списка типов акций
    function createStockTypeSelector() {
        return `
            <div class="stock-type-selector">
                <h3>Выберите тип акций:</h3>
                <div class="type-list">
                    <div class="type-group">
                        <h4>Спекулятивные акции</h4>
                        <button class="type-btn" data-type="myt4u">MYT4U - Спекулятивные акции без пассивного дохода</button>
                        <button class="type-btn" data-type="on2u">ON2U - Спекулятивные акции без пассивного дохода</button>
                        <button class="type-btn" data-type="ok4u">OK4U - Спекулятивные акции без пассивного дохода</button>
                        <button class="type-btn" data-type="gro4us">GRO4US - Спекулятивные акции без пассивного дохода</button>
                    </div>
                    <div class="type-group">
                        <h4>Дивидендные акции</h4>
                        <button class="type-btn" data-type="2bigpower">2BIGPOWER - Стабильные акции с фиксированным доходом $10 в месяц</button>
                        <button class="type-btn" data-type="cd">CD - Акции с фиксированным месячным доходом $20</button>
                    </div>
                </div>
                <button class="back-button">Назад</button>
            </div>
        `;
    }

    // Создание списка типов недвижимости
    function createRealEstateTypeSelector() {
        return `
            <div class="realestate-type-selector">
                <h3>Выберите тип недвижимости:</h3>
                <div class="type-list">
                    <div class="type-group">
                        <h4>Дома</h4>
                        <button class="type-btn" data-type="house-2-1">2/1 (2 спальни, 1 ванная)</button>
                        <button class="type-btn" data-type="house-3-2">3/2 (3 спальни, 2 ванные)</button>
                    </div>
                    <div class="type-group">
                        <h4>Многоквартирные дома</h4>
                        <button class="type-btn" data-type="plex-2">2 плекс (Дуплекс)</button>
                        <button class="type-btn" data-type="plex-4">4 плекс</button>
                        <button class="type-btn" data-type="plex-8">8 плекс</button>
                        <button class="type-btn" data-type="plex-16">16 плекс</button>
                        <button class="type-btn" data-type="apartment-building">Многоквартирный дом</button>
                    </div>
                    <div class="type-group">
                        <h4>Земля</h4>
                        <button class="type-btn" data-type="land">Земельный участок</button>
                    </div>
                </div>
                <button class="back-button">Назад</button>
            </div>
        `;
    }

    // Создание списка типов драгоценных металлов
    function createPreciousMetalsTypeSelector() {
        return `
            <div class="precious-metals-type-selector">
                <h3>Выберите тип драгоценного металла:</h3>
                <div class="type-list">
                    <div class="type-group">
                        <h4>Инвестиционные монеты</h4>
                        <button class="type-btn" data-type="krugerrand">Золотой Крюгерранд - Инвестиционная монета</button>
                    </div>
                    <div class="type-group">
                        <h4>Коллекционные монеты</h4>
                        <button class="type-btn" data-type="rare-coin">Редкая золотая монета 16 века</button>
                    </div>
                </div>
                <button class="back-button">Назад</button>
            </div>
        `;
    }

    // Показ формы для конкретного типа акций
    function showStockForm(item) {
        const content = modal.querySelector('.asset-categories');
        content.innerHTML = `
            <div class="assets-list">
                ${createAssetCard(item, 'stocks')}
            </div>
            <div class="buy-controls">
                <div class="wallet-info">В кошельке: <span id="modal-wallet-amount">${window.cash || 0}</span></div>
                <button class="back-button">Назад к типам акций</button>
            </div>
        `;

        // Добавляем обработчик для кнопки "Назад"
        content.querySelector('.back-button').addEventListener('click', () => {
            showCategoryItems('stocks');
        });

        // Инициализируем обработчики для полей акций
        initializeStockInputs();
    }

    // Показ формы для создания бизнеса
    function showBusinessForm() {
        const content = modal.querySelector('.asset-categories');
        content.innerHTML = `
            <div class="assets-list">
                <div class="asset-card">
                    <h3>Новый бизнес</h3>
                    <div class="asset-info">
                        <div class="business-inputs">
                            <div class="input-group">
                                <label>Название бизнеса:</label>
                                <input type="text" class="business-name" placeholder="Например: Кофейня">
                            </div>
                            <div class="input-group">
                                <label>Цена ($):</label>
                                <input type="number" class="business-price" min="0" step="1000" placeholder="Полная стоимость">
                            </div>
                            <div class="input-group">
                                <label>Первый взнос ($):</label>
                                <input type="number" class="business-down-payment" min="0" step="1000" placeholder="Сумма первого взноса">
                            </div>
                            <div class="input-group">
                                <label>Пассив ($):</label>
                                <input type="number" class="business-liability" min="0" step="1000" placeholder="Сумма долга">
                            </div>
                            <div class="input-group">
                                <label>Денежный поток ($):</label>
                                <input type="number" class="business-cashflow" step="100" placeholder="Ежемесячный доход">
                            </div>
                            <button class="buy-business-btn">Купить бизнес</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="buy-controls">
                <div class="wallet-info">В кошельке: <span id="modal-wallet-amount">${window.cash || 0}</span></div>
                <button class="back-button">Назад</button>
            </div>
        `;

        // Добавляем обработчики для полей
        const form = content.querySelector('.business-inputs');
        const priceInput = form.querySelector('.business-price');
        const downPaymentInput = form.querySelector('.business-down-payment');
        const liabilityInput = form.querySelector('.business-liability');
        const cashflowInput = form.querySelector('.business-cashflow');
        const buyButton = form.querySelector('.buy-business-btn');
        const nameInput = form.querySelector('.business-name');

        // Обработчик покупки бизнеса
        buyButton.addEventListener('click', handleBusinessPurchase);
        buyButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.opacity = '0.7';
        });
        buyButton.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.style.opacity = '1';
            handleBusinessPurchase();
        });

        function handleBusinessPurchase() {
            const name = nameInput.value.trim();
            const price = parseFloat(priceInput.value) || 0;
            const downPayment = parseFloat(downPaymentInput.value) || 0;
            const liability = parseFloat(liabilityInput.value) || 0;
            const cashflow = parseFloat(cashflowInput.value) || 0;

            // Валидация
            if (!name) {
                alert('Введите название бизнеса!');
                return;
            }
            if (price < 0) {
                alert('Цена не может быть отрицательной!');
                return;
            }
            if (downPayment < 0) {
                alert('Первый взнос не может быть отрицательным!');
                return;
            }
            if (liability < 0) {
                alert('Пассив не может быть отрицательным!');
                return;
            }
            if (downPayment > window.cash) {
                alert('Недостаточно средств для первого взноса!');
                return;
            }

            // Подтверждение покупки
            const confirmText = `Подтвердите ${price === 0 ? 'получение' : 'покупку'} бизнеса:\n` +
                `Название: ${name}\n` +
                `${price > 0 ? `Цена: $${price}\n` : ''}` +
                `${downPayment > 0 ? `Первый взнос: $${downPayment}\n` : ''}` +
                `${liability > 0 ? `Пассив: $${liability}\n` : ''}` +
                `Денежный поток: $${cashflow}`;

            if (!confirm(confirmText)) {
                return;
            }

            // Списываем деньги
            if (downPayment > 0) {
                window.cash -= downPayment;
            }

            // Добавляем бизнес в активы
            if (!window.data.asset) window.data.asset = [];
            window.data.asset.push({
                id: `business-${Date.now()}`,
                name: name,
                type: 'business',
                value: price,
                isTransferred: price === 0
            });

            // Добавляем пассив если есть
            if (liability > 0) {
                if (!window.data.liability) window.data.liability = [];
                window.data.liability.push({
                    id: `business-debt-${Date.now()}`,
                    name: `Долг: ${name}`,
                    type: 'business',
                    value: liability,
                    source: `business-${Date.now()}`
                });
            }

            // Добавляем денежный поток
            if (cashflow > 0) {
                if (!window.data.income) window.data.income = [];
                window.data.income.push({
                    id: `business-income-${Date.now()}`,
                    name: `Доход: ${name}`,
                    type: 'passive',
                    value: cashflow,
                    source: name
                });
            }

            // Добавляем запись в историю
            if (!window.data.history) window.data.history = [];
            window.data.history.push({
                type: 'buy',
                assetName: name,
                amount: downPayment,
                date: new Date().toISOString()
            });

            // Обновляем отображение
            window.renderCash();
            window.renderAll();
            window.renderLiability();
            window.renderIncome();
            window.renderSummary();
            window.renderHistory();
            autoSave();

            // Закрываем модальное окно
            modal.classList.remove('active');
        }

        // Добавляем обработчик для кнопки "Назад"
        content.querySelector('.back-button').addEventListener('click', showCategories);
    }

    // Показ формы для конкретного типа драгоценного металла
    function showPreciousMetalForm(item) {
        const content = modal.querySelector('.asset-categories');
        content.innerHTML = `
            <div class="assets-list">
                <div class="asset-card">
                    <h3>${item.name}</h3>
                    <div class="asset-info">
                        <div class="precious-metal-inputs">
                            <div class="input-group">
                                <label>Цена ($):</label>
                                <input type="number" class="metal-price" min="0" step="1000" inputmode="numeric" pattern="[0-9]*">
                            </div>
                            <div class="input-group">
                                <label>Первый взнос ($):</label>
                                <input type="number" class="metal-down-payment" min="0" step="10" inputmode="numeric" pattern="[0-9]*">
                            </div>
                            <button class="buy-metal-btn">Купить</button>
                        </div>
                        <div class="asset-description">${item.description}</div>
                    </div>
                </div>
            </div>
            <div class="buy-controls">
                <div class="wallet-info">В кошельке: <span id="modal-wallet-amount">${window.cash || 0}</span></div>
                <button class="back-button">Назад к типам металлов</button>
            </div>
        `;

        // Добавляем обработчики
        const form = content.querySelector('.precious-metal-inputs');
        const priceInput = form.querySelector('.metal-price');
        const downPaymentInput = form.querySelector('.metal-down-payment');
        const buyButton = form.querySelector('.buy-metal-btn');

        // Обработчик покупки
        buyButton.addEventListener('click', () => {
            const price = parseFloat(priceInput.value) || 0;
            const downPayment = parseFloat(downPaymentInput.value) || 0;

            // Валидация
            if (price < 0) {
                alert('Цена не может быть отрицательной!');
                return;
            }
            if (downPayment < 0) {
                alert('Первый взнос не может быть отрицательным!');
                return;
            }
            if (downPayment > price) {
                alert('Первый взнос не может быть больше цены!');
                return;
            }
            if (downPayment > 0 && downPayment > window.cash) {
                alert('Недостаточно средств для первого взноса!');
                return;
            }

            // Подтверждение покупки
            const confirmText = `Подтвердите ${price === 0 ? 'получение' : 'покупку'}:\n` +
                `${item.name}\n` +
                `${price > 0 ? `Цена: $${price}\n` : ''}` +
                `${downPayment > 0 ? `Первый взнос: $${downPayment}` : ''}`;

            if (!confirm(confirmText)) {
                return;
            }

            // Списываем деньги только если есть первый взнос
            if (downPayment > 0) {
                window.cash -= downPayment;
            }

            // Добавляем в активы
            if (!window.data.asset) window.data.asset = [];
            window.data.asset.push({
                id: `${item.name}-${Date.now()}`,
                name: item.name,
                type: 'preciousmetals',
                value: price,
                isTransferred: price === 0
            });

            // Добавляем запись в историю
            if (!window.data.history) window.data.history = [];
            window.data.history.push({
                type: 'buy',
                assetName: item.name,
                amount: downPayment,
                date: new Date().toISOString()
            });

            // Обновляем отображение
            window.renderCash();
            window.renderAll();
            window.renderSummary();
            window.renderHistory();
            autoSave();

            // Закрываем модальное окно
            modal.classList.remove('active');
        });

        // Добавляем обработчик для кнопки "Назад"
        content.querySelector('.back-button').addEventListener('click', () => {
            showCategoryItems('preciousmetals');
        });
    }

    // Показ формы для всякой всячины
    function showMiscForm() {
        const content = modal.querySelector('.asset-categories');
        content.innerHTML = `
            <div class="assets-list">
                <div class="asset-card misc-card">
                    <h3>Новая покупка</h3>
                    <div class="asset-info">
                        <div class="misc-inputs">
                            <div class="input-group">
                                <label>Название:</label>
                                <input type="text" class="misc-name" placeholder="Название покупки">
                            </div>
                            <div class="input-group">
                                <label>Цена ($):</label>
                                <input type="number" class="misc-price" min="0" step="10" inputmode="numeric" pattern="[0-9]*">
                            </div>
                            <div class="input-group">
                                <label>Первый взнос ($):</label>
                                <input type="number" class="misc-down-payment" min="0" step="10" inputmode="numeric" pattern="[0-9]*">
                            </div>
                            <div class="input-group">
                                <label>Ежемесячный расход ($):</label>
                                <input type="number" class="misc-expense" min="0" step="10" inputmode="numeric" pattern="[0-9]*">
                            </div>
                            <button class="buy-misc-btn">Купить</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="buy-controls">
                <div class="wallet-info">В кошельке: <span id="modal-wallet-amount">${window.cash || 0}</span></div>
                <button class="back-button">Назад</button>
            </div>
        `;

        // Добавляем обработчики
        const form = content.querySelector('.misc-inputs');
        const nameInput = form.querySelector('.misc-name');
        const priceInput = form.querySelector('.misc-price');
        const downPaymentInput = form.querySelector('.misc-down-payment');
        const expenseInput = form.querySelector('.misc-expense');
        const buyButton = form.querySelector('.buy-misc-btn');

        // Обработчик покупки
        const handleMiscPurchase = () => {
            const name = nameInput.value.trim();
            const price = parseFloat(priceInput.value) || 0;
            const downPayment = parseFloat(downPaymentInput.value) || 0;
            const expense = parseFloat(expenseInput.value) || 0;

            // Валидация
            if (!name) {
                alert('Введите название!');
                return;
            }
            if (price < 0) {
                alert('Цена не может быть отрицательной!');
                return;
            }
            if (downPayment < 0) {
                alert('Первый взнос не может быть отрицательным!');
                return;
            }
            if (downPayment > price) {
                alert('Первый взнос не может быть больше цены!');
                return;
            }
            if (expense < 0) {
                alert('Расход не может быть отрицательным!');
                return;
            }
            if (downPayment > 0 && downPayment > window.cash) {
                alert('Недостаточно средств для первого взноса!');
                return;
            }

            // Подтверждение покупки
            const confirmText = `Подтвердите ${price === 0 ? 'получение' : 'покупку'}:\n` +
                `${name}\n` +
                `${price > 0 ? `Цена: $${price}\n` : ''}` +
                `${downPayment > 0 ? `Первый взнос: $${downPayment}\n` : ''}` +
                `${expense > 0 ? `Ежемесячный расход: $${expense}` : ''}`;

            if (!confirm(confirmText)) {
                return;
            }

            // Списываем деньги если есть первый взнос
            if (downPayment > 0) {
                window.cash -= downPayment;
            }

            // Добавляем в активы
            if (!window.data.asset) window.data.asset = [];
            window.data.asset.push({
                id: `misc-${Date.now()}`,
                name: name,
                type: 'misc',
                value: price,
                isTransferred: price === 0
            });

            // Если есть остаток после первого взноса, добавляем в пассивы
            const remainingDebt = price - downPayment;
            if (remainingDebt > 0) {
                if (!window.data.liability) window.data.liability = [];
                window.data.liability.push({
                    id: `misc-debt-${Date.now()}`,
                    name: `Долг: ${name}`,
                    type: 'misc',
                    value: remainingDebt
                });
            }

            // Если есть ежемесячный расход, добавляем в расходы
            if (expense > 0) {
                if (!window.data.expense) window.data.expense = [];
                window.data.expense.push({
                    id: `misc-expense-${Date.now()}`,
                    name: `Обслуживание: ${name}`,
                    type: 'misc',
                    value: expense
                });
            }

            // Добавляем запись в историю
            if (!window.data.history) window.data.history = [];
            window.data.history.push({
                type: 'buy',
                assetName: name,
                amount: downPayment,
                date: new Date().toISOString()
            });

            // Обновляем отображение
            window.renderCash();
            window.renderAll();
            window.renderLiability();
            window.renderExpense();
            window.renderSummary();
            window.renderHistory();
            autoSave();

            // Закрываем модальное окно
            modal.classList.remove('active');
        };

        // Добавляем обработчики для клика и touch-событий
        buyButton.addEventListener('click', handleMiscPurchase);
        buyButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.style.opacity = '0.7';
        });
        buyButton.addEventListener('touchend', function(e) {
            e.preventDefault();
            this.style.opacity = '1';
            handleMiscPurchase();
        });

        // Добавляем обработчик для кнопки "Назад"
        content.querySelector('.back-button').addEventListener('click', showCategories);
    }

    // Показ категорий активов
    function showCategoryItems(category) {
        const categoryData = ASSET_CATEGORIES[category];
        if (!categoryData) return;

        // Обновляем заголовок
        modal.querySelector('h2').textContent = categoryData.title;

        // Заменяем содержимое модального окна
        const content = modal.querySelector('.asset-categories');

        if (category === 'realestate') {
            // Показываем селектор типов недвижимости
            content.innerHTML = createRealEstateTypeSelector();

            // Добавляем обработчики для кнопок выбора типа
            content.querySelectorAll('.type-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const typeId = btn.dataset.type;
                    const item = categoryData.items.find(i => i.id === typeId);
                    if (item) {
                        showRealEstateForm(item);
                    }
                });
            });
        } else if (category === 'stocks') {
            // Показываем селектор типов акций
            content.innerHTML = createStockTypeSelector();

            // Добавляем обработчики для кнопок выбора типа
            content.querySelectorAll('.type-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const typeId = btn.dataset.type;
                    const item = categoryData.items.find(i => i.id === typeId);
                    if (item) {
                        showStockForm(item);
                    }
                });
            });
        } else if (category === 'business') {
            // Показываем форму создания бизнеса
            showBusinessForm();
        } else if (category === 'preciousmetals') {
            // Показываем селектор типов драгоценных металлов
            content.innerHTML = createPreciousMetalsTypeSelector();

            // Добавляем обработчики для кнопок выбора типа
            content.querySelectorAll('.type-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const typeId = btn.dataset.type;
                    const item = categoryData.items.find(i => i.id === typeId);
                    if (item) {
                        showPreciousMetalForm(item);
                    }
                });
            });
        } else if (category === 'misc') {
            showMiscForm();
        } else {
            content.innerHTML = `
                <div class="assets-list">
                    ${categoryData.items.map(item => createAssetCard(item, category)).join('')}
                </div>
                <div class="buy-controls">
                    <div class="wallet-info">В кошельке: <span id="modal-wallet-amount">${window.cash || 0}</span></div>
                    <button class="back-button">Назад</button>
                </div>
            `;
        }

        // Добавляем обработчик для кнопки "Назад"
        content.querySelector('.back-button').addEventListener('click', showCategories);
    }

    // Показ формы для конкретного типа недвижимости
    function showRealEstateForm(item) {
        const content = modal.querySelector('.asset-categories');
        content.innerHTML = `
            <div class="assets-list">
                ${createAssetCard(item, 'realestate')}
            </div>
            <div class="buy-controls">
                <div class="wallet-info">В кошельке: <span id="modal-wallet-amount">${window.cash || 0}</span></div>
                <button class="back-button">Назад к типам недвижимости</button>
            </div>
        `;

        // Добавляем обработчик для кнопки "Назад"
        content.querySelector('.back-button').addEventListener('click', () => {
            showCategoryItems('realestate');
        });

        // Инициализируем обработчики для полей недвижимости
        initializePropertyInputs();
    }

    // Создание карточки актива в зависимости от категории
    function createAssetCard(item, category) {
        let details = '';
        switch(category) {
            case 'stocks':
                if (item.type === 'speculative') {
                    details = `
                        <div class="asset-info">
                            <div class="stock-inputs">
                                <div class="input-group">
                                    <label>Цена за акцию ($):</label>
                                    <input type="number" class="price-per-share" min="0" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Количество акций:</label>
                                    <input type="number" class="shares-amount" min="1" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="total-price">Общая стоимость: $<span>0</span></div>
                                <button class="buy-stock-btn">Купить</button>
                            </div>
                        </div>
                    `;
                } else if (item.type === 'dividend') {
                    // Для 2BIGPOWER и CD разрешаем ручной ввод цены
                    const allowCustomPrice = ['2bigpower', 'cd'].includes(item.id);
                    let priceInputHtml = '';
                    if (allowCustomPrice) {
                        priceInputHtml = `
                            <input type=\"number\" class=\"price-per-share\" min=\"0\" step=\"1\" value=\"${item.pricePerShare}\">\n                        `;
                    } else if (item.alternativePrice) {
                        priceInputHtml = `<select class=\"price-select\">\n                            <option value=\"${item.pricePerShare}\">$${item.pricePerShare}</option>\n                            <option value=\"${item.alternativePrice}\">$${item.alternativePrice}</option>\n                        </select>`;
                    } else {
                        priceInputHtml = `<span>$${item.pricePerShare}</span>`;
                    }

                    const dividendInfo = item.dividendType === 'percent'
                        ? `${item.dividendValue}% годовых`
                        : `$${item.dividendValue} в месяц`;

                    details = `
                        <div class=\"asset-info\">\n                            <div class=\"stock-inputs dividend\">\n                                <div class=\"price-info\">\n                                    <label>Цена за акцию:</label>\n                                    ${priceInputHtml}\n                                </div>\n                                <div class=\"dividend-info\">\n                                    <label>Денежный поток:</label>\n                                    <span>${dividendInfo}</span>\n                                </div>\n                                <div class=\"input-group\">\n                                    <label>Количество акций:</label>\n                                    <input type=\"number\" class=\"shares-amount\" min=\"1\" step=\"1\">\n                                </div>\n                                <div class=\"total-price\">Общая стоимость: $<span>0</span></div>\n                                <div class=\"total-dividend\">Доход: <span>$0</span> в месяц</div>\n                                <button class=\"buy-stock-btn\">Купить</button>\n                            </div>\n                        </div>\n                    `;
                }
                break;
            case 'realestate':
                if (item.type === 'land') {
                    details = `
                        <div class="asset-info">
                            <div class="property-inputs">
                                <div class="input-group">
                                    <label>Количество акров:</label>
                                    <input type="number" class="property-acres" step="0.1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Цена ($):</label>
                                    <input type="number" class="property-price" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Первый взнос ($):</label>
                                    <input type="number" class="property-down-payment" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Ипотека ($):</label>
                                    <input type="number" class="property-mortgage" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Денежный поток ($):</label>
                                    <input type="number" class="property-cashflow" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <button class="buy-property-btn">Купить</button>
                            </div>
                            <div class="asset-description">${item.description}</div>
                        </div>
                    `;
                } else if (item.type === 'apartment') {
                    details = `
                        <div class="asset-info">
                            <div class="property-inputs">
                                <div class="input-group">
                                    <label>Количество квартир:</label>
                                    <input type="number" class="property-units" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Цена ($):</label>
                                    <input type="number" class="property-price" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Первый взнос ($):</label>
                                    <input type="number" class="property-down-payment" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Ипотека ($):</label>
                                    <input type="number" class="property-mortgage" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Денежный поток ($):</label>
                                    <input type="number" class="property-cashflow" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <button class="buy-property-btn">Купить</button>
                            </div>
                            <div class="asset-description">${item.description}</div>
                        </div>
                    `;
                } else {
                    details = `
                        <div class="asset-info">
                            <div class="property-inputs">
                                <div class="input-group">
                                    <label>Цена ($):</label>
                                    <input type="number" class="property-price" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Первый взнос ($):</label>
                                    <input type="number" class="property-down-payment" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Ипотека ($):</label>
                                    <input type="number" class="property-mortgage" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <div class="input-group">
                                    <label>Денежный поток ($):</label>
                                    <input type="number" class="property-cashflow" step="1" inputmode="numeric" pattern="[0-9]*">
                                </div>
                                <button class="buy-property-btn">Купить</button>
                            </div>
                            <div class="asset-description">${item.description}</div>
                        </div>
                    `;
                }
                break;
            case 'business':
                details = `
                    <div class="asset-price">Стоимость: ${item.price}</div>
                    <div class="asset-income">Доход в месяц: +${item.monthlyIncome}</div>
                `;
                break;
        }

        const cardTypeClass = item.type === 'dividend' ? 'dividend' : 'speculative';
        
        return `
            <div class="asset-card" data-item-id="${item.id}" data-type="${item.type || ''}">
                <h3>${item.name}</h3>
                <div class="asset-info">
                    ${details}
                </div>
            </div>
        `;
    }

    // Добавляем обработчики для ввода цены акций
    function initializeStockInputs() {
        const stockInputs = document.querySelectorAll('.stock-inputs');
        
        stockInputs.forEach(inputGroup => {
            const priceInput = inputGroup.querySelector('.price-per-share');
            const priceSelect = inputGroup.querySelector('.price-select');
            const sharesInput = inputGroup.querySelector('.shares-amount');
            const totalSpan = inputGroup.querySelector('.total-price span');
            const dividendSpan = inputGroup.querySelector('.total-dividend span');
            const buyButton = inputGroup.querySelector('.buy-stock-btn');
            
            function updateTotal() {
                const price = priceSelect 
                    ? parseFloat(priceSelect.value) 
                    : (priceInput ? parseFloat(priceInput.value) : 0);
                const shares = parseInt(sharesInput.value) || 0;
                const total = price * shares;
                totalSpan.textContent = total.toFixed(0);

                // Расчет дивидендов если это акции с пассивным доходом
                if (dividendSpan) {
                    const card = inputGroup.closest('.asset-card');
                    const itemId = card.dataset.itemId;
                    const item = ASSET_CATEGORIES.stocks.items.find(i => i.id === itemId);
                    
                    if (item && item.type === 'dividend') {
                        let monthlyIncome = 0;
                        if (item.dividendType === 'fixed') {
                            monthlyIncome = shares * item.dividendValue;
                        } else if (item.dividendType === 'percent') {
                            // Конвертируем годовой процент в месячный доход
                            monthlyIncome = (shares * price * (item.dividendValue / 100)) / 12;
                        }
                        dividendSpan.textContent = monthlyIncome.toFixed(0);
                    }
                }
            }

            if (priceInput) priceInput.addEventListener('input', updateTotal);
            if (priceSelect) priceSelect.addEventListener('change', updateTotal);
            sharesInput.addEventListener('input', updateTotal);

            // Добавляем обработчик для кнопки покупки
            if (buyButton) {
                buyButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Предотвращаем всплытие события
                    const card = inputGroup.closest('.asset-card');
                    const itemId = card.dataset.itemId;
                    const item = ASSET_CATEGORIES.stocks.items.find(i => i.id === itemId);
                    if (item) {
                        showAssetDetails(item, 'stocks');
                    }
                });
            }
        });
    }

    // Инициализация обработчиков для ввода данных недвижимости
    function initializePropertyInputs() {
        const propertyInputs = document.querySelectorAll('.property-inputs');
        
        propertyInputs.forEach(inputGroup => {
            const priceInput = inputGroup.querySelector('.property-price');
            const downPaymentInput = inputGroup.querySelector('.property-down-payment');
            const mortgageInput = inputGroup.querySelector('.property-mortgage');
            const cashflowInput = inputGroup.querySelector('.property-cashflow');
            const buyButton = inputGroup.querySelector('.buy-property-btn');
            
            // Добавляем обработчик для кнопки покупки
            if (buyButton) {
                buyButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Предотвращаем всплытие события
                    const card = inputGroup.closest('.asset-card');
                    const itemId = card.dataset.itemId;
                    const item = ASSET_CATEGORIES.realestate.items.find(i => i.id === itemId);
                    if (item) {
                        showPropertyDetails(item, 'realestate');
                    }
                });
            }
        });
    }

    // Показ деталей выбранного актива
    function showAssetDetails(item, category) {
        const content = modal.querySelector('.asset-categories');
        let totalPrice = 0;
        let monthlyIncome = 0;

        // Обработка акций
        if (category === 'stocks') {
            const stockInputs = content.querySelector(`[data-item-id="${item.id}"] .stock-inputs`);
            if (!stockInputs) return;

            const sharesInput = stockInputs.querySelector('.shares-amount');
            const shares = parseInt(sharesInput.value) || 0;
            let pricePerShare = 0;
            
            if (item.type === 'speculative') {
                const priceInput = stockInputs.querySelector('.price-per-share');
                pricePerShare = parseFloat(priceInput.value);
                pricePerShare = isNaN(pricePerShare) ? 0 : pricePerShare;
                totalPrice = shares * pricePerShare;
            } else if (item.type === 'dividend') {
                // Для 2BIGPOWER и CD используем поле price-per-share, если оно есть
                const priceInput = stockInputs.querySelector('.price-per-share');
                const priceSelect = stockInputs.querySelector('.price-select');
                if (priceInput) {
                    pricePerShare = parseFloat(priceInput.value);
                    pricePerShare = isNaN(pricePerShare) ? 0 : pricePerShare;
                } else if (priceSelect) {
                    pricePerShare = parseFloat(priceSelect.value);
                } else {
                    pricePerShare = item.pricePerShare;
                }
                totalPrice = shares * pricePerShare;

                if (item.dividendType === 'fixed') {
                    monthlyIncome = shares * item.dividendValue;
                } else if (item.dividendType === 'percent') {
                    monthlyIncome = (shares * pricePerShare * (item.dividendValue / 100)) / 12;
                }
            }

            if (totalPrice > 0 && totalPrice > window.cash) {
                alert('Недостаточно средств для покупки!');
                return;
            }

            if (shares <= 0) {
                alert('Введите количество акций!');
                return;
            }
            if (pricePerShare < 0) {
                alert('Цена за акцию не может быть отрицательной!');
                return;
            }

            let confirmText = `Подтвердите ${totalPrice === 0 ? 'получение' : 'покупку'}:\n`;
            confirmText += `${shares} акций ${item.name}\n`;
            if (totalPrice > 0) {
                confirmText += `Стоимость: $${totalPrice}\n`;
            }
            if (monthlyIncome > 0) {
                confirmText += `Денежный поток: $${monthlyIncome.toFixed(0)}`;
            }

            if (!confirm(confirmText)) {
                return;
            }

            if (totalPrice > 0) {
                window.cash -= totalPrice;
            }

            if (!window.data.asset) window.data.asset = [];
            window.data.asset.push({
                id: `${item.name}-${Date.now()}`,
                name: item.name,
                quantity: shares,
                price: pricePerShare,
                type: 'stocks'
            });

            if (monthlyIncome > 0) {
                if (!window.data.income) window.data.income = [];
                window.data.income.push({
                    id: `${item.id}-income-${Date.now()}`,
                    name: `Денежный поток: ${item.name}`,
                    value: Math.floor(monthlyIncome),
                    type: 'passive',
                    source: item.name
                });
            }

            // Добавляем запись в историю
            if (!window.data.history) window.data.history = [];
            window.data.history.push({
                type: 'buy',
                assetName: item.name,
                amount: totalPrice,
                date: new Date().toISOString()
            });

            window.renderCash();
            window.renderAll();
            window.renderIncome();
            window.renderSummary();
            window.renderHistory();
            autoSave();

            sharesInput.value = '';
            if (item.type === 'speculative') {
                const priceInput = stockInputs.querySelector('.price-per-share');
                priceInput.value = '';
            }

            modal.classList.remove('active');
        }
        // Обработка недвижимости
        else if (category === 'realestate') {
            const propertyInputs = content.querySelector(`[data-item-id="${item.id}"] .property-inputs`);
            if (!propertyInputs) return;

            const price = parseFloat(propertyInputs.querySelector('.property-price').value) || 0;
            const downPayment = parseFloat(propertyInputs.querySelector('.property-down-payment').value) || 0;
            const mortgage = parseFloat(propertyInputs.querySelector('.property-mortgage').value) || 0;
            const cashflow = parseFloat(propertyInputs.querySelector('.property-cashflow').value) || 0;

            // Получаем дополнительные значения в зависимости от типа
            let additionalInfo = '';
            if (item.type === 'land') {
                const acres = parseFloat(propertyInputs.querySelector('.property-acres').value) || 0;
                if (acres <= 0) {
                    alert('Укажите количество акров!');
                    return;
                }
                additionalInfo = `${acres} акров`;
            } else if (item.type === 'apartment') {
                const units = parseInt(propertyInputs.querySelector('.property-units').value) || 0;
                if (units <= 0) {
                    alert('Укажите количество квартир!');
                    return;
                }
                additionalInfo = `${units} квартир`;
            }

            if (price < 0) {
                alert('Цена не может быть отрицательной!');
                return;
            }
            if (downPayment < 0) {
                alert('Первый взнос не может быть отрицательным!');
                return;
            }
            if (mortgage < 0) {
                alert('Ипотека не может быть отрицательной!');
                return;
            }

            if (downPayment > 0 && downPayment > window.cash) {
                alert('Недостаточно средств для первого взноса!');
                return;
            }

            let confirmText = `Подтвердите ${price === 0 ? 'получение' : 'покупку'}:\n`;
            confirmText += `${item.name}${additionalInfo ? ` (${additionalInfo})` : ''}\n`;
            if (price > 0) {
                confirmText += `Цена: $${price}\n`;
            }
            if (downPayment > 0) {
                confirmText += `Первый взнос: $${downPayment}\n`;
            }
            confirmText += `Денежный поток: $${cashflow}`;

            if (!confirm(confirmText)) {
                return;
            }

            if (downPayment > 0) {
                window.cash -= downPayment;
            }

            // Формируем название с дополнительной информацией
            const fullName = additionalInfo ? `${item.name} (${additionalInfo})` : item.name;

            // Добавляем актив
            if (!window.data.asset) window.data.asset = [];
            window.data.asset.push({
                id: `${item.id}-${Date.now()}`,
                name: fullName,
                type: 'realestate',
                value: price,
                isTransferred: price === 0
            });

            // Добавляем ипотеку в пассивы
            if (mortgage > 0) {
                if (!window.data.liability) window.data.liability = [];
                window.data.liability.push({
                    id: `mortgage-${item.id}-${Date.now()}`,
                    name: `Ипотека: ${fullName}`,
                    type: 'mortgage',
                    value: mortgage
                });
            }

            // Добавляем денежный поток
            if (!window.data.income) window.data.income = [];
            window.data.income.push({
                id: `${item.id}-income-${Date.now()}`,
                name: `Денежный поток: ${fullName}`,
                type: 'passive',
                value: cashflow,
                source: fullName
            });

            // Добавляем запись в историю
            if (!window.data.history) window.data.history = [];
            window.data.history.push({
                type: 'buy',
                assetName: fullName,
                amount: downPayment,
                date: new Date().toISOString()
            });

            // Обновляем отображение
            window.renderCash();
            window.renderAll();
            window.renderLiability();
            window.renderIncome();
            window.renderSummary();
            window.renderHistory();
            autoSave();

            // Очищаем поля ввода
            propertyInputs.querySelector('.property-price').value = '';
            propertyInputs.querySelector('.property-down-payment').value = '';
            propertyInputs.querySelector('.property-mortgage').value = '';
            propertyInputs.querySelector('.property-cashflow').value = '';
            if (item.type === 'land') {
                propertyInputs.querySelector('.property-acres').value = '';
            } else if (item.type === 'apartment') {
                propertyInputs.querySelector('.property-units').value = '';
            }

            modal.classList.remove('active');
        }
    }

    // Показ деталей выбранной недвижимости и процесс покупки
    function showPropertyDetails(item, category) {
        const content = modal.querySelector('.asset-categories');
        const propertyInputs = content.querySelector(`[data-item-id="${item.id}"] .property-inputs`);
        if (!propertyInputs) return;

        // Получаем введенные значения
        const price = parseFloat(propertyInputs.querySelector('.property-price').value) || 0;
        const downPayment = parseFloat(propertyInputs.querySelector('.property-down-payment').value) || 0;
        const mortgage = parseFloat(propertyInputs.querySelector('.property-mortgage').value) || 0;
        const cashflow = parseFloat(propertyInputs.querySelector('.property-cashflow').value) || 0;

        // Получаем дополнительные значения в зависимости от типа
        let additionalInfo = '';
        if (item.type === 'land') {
            const acres = parseFloat(propertyInputs.querySelector('.property-acres').value) || 0;
            if (acres <= 0) {
                alert('Укажите количество акров!');
                return;
            }
            additionalInfo = `${acres} акров`;
        } else if (item.type === 'apartment') {
            const units = parseInt(propertyInputs.querySelector('.property-units').value) || 0;
            if (units <= 0) {
                alert('Укажите количество квартир!');
                return;
            }
            additionalInfo = `${units} квартир`;
        }

        // Проверяем введены ли все данные
        if (price < 0) {
            alert('Цена не может быть отрицательной!');
            return;
        }
        if (downPayment < 0) {
            alert('Первый взнос не может быть отрицательным!');
            return;
        }
        if (mortgage < 0) {
            alert('Ипотека не может быть отрицательной!');
            return;
        }

        // Проверяем достаточно ли денег для первого взноса
        if (downPayment > 0 && downPayment > window.cash) {
            alert('Недостаточно средств для первого взноса!');
            return;
        }

        // Подготовка текста для подтверждения
        let confirmText = `Подтвердите ${price === 0 ? 'получение' : 'покупку'}:\n`;
        confirmText += `${item.name}${additionalInfo ? ` (${additionalInfo})` : ''}\n`;
        if (price > 0) {
            confirmText += `Цена: $${price}\n`;
        }
        if (downPayment > 0) {
            confirmText += `Первый взнос: $${downPayment}\n`;
        }
        confirmText += `Денежный поток: $${cashflow}`;

        // Подтверждение покупки
        if (!confirm(confirmText)) {
            return;
        }

        // Списываем деньги (только если есть первый взнос)
        if (downPayment > 0) {
            window.cash -= downPayment;
        }

        // Формируем название с дополнительной информацией
        const fullName = additionalInfo ? `${item.name} (${additionalInfo})` : item.name;

        // Добавляем актив
        if (!window.data.asset) window.data.asset = [];
        window.data.asset.push({
            id: `${item.id}-${Date.now()}`,
            name: fullName,
            type: 'realestate',
            value: price,
            isTransferred: price === 0
        });

        // Добавляем ипотеку в пассивы
        if (mortgage > 0) {
            if (!window.data.liability) window.data.liability = [];
            window.data.liability.push({
                id: `mortgage-${item.id}-${Date.now()}`,
                name: `Ипотека: ${fullName}`,
                type: 'mortgage',
                value: mortgage
            });
        }

        // Добавляем денежный поток
        if (!window.data.income) window.data.income = [];
        window.data.income.push({
            id: `${item.id}-income-${Date.now()}`,
            name: `Денежный поток: ${fullName}`,
            type: 'passive',
            value: cashflow,
            source: fullName
        });

        // Добавляем запись в историю
        if (!window.data.history) window.data.history = [];
        window.data.history.push({
            type: 'buy',
            assetName: fullName,
            amount: downPayment,
            date: new Date().toISOString()
        });

        // Обновляем отображение
        window.renderCash();
        window.renderAll();
        window.renderLiability();
        window.renderIncome();
        window.renderSummary();
        window.renderHistory();
        autoSave();

        // Очищаем поля ввода
        propertyInputs.querySelector('.property-price').value = '';
        propertyInputs.querySelector('.property-down-payment').value = '';
        propertyInputs.querySelector('.property-mortgage').value = '';
        propertyInputs.querySelector('.property-cashflow').value = '';
        if (item.type === 'land') {
            propertyInputs.querySelector('.property-acres').value = '';
        } else if (item.type === 'apartment') {
            propertyInputs.querySelector('.property-units').value = '';
        }

        // Закрываем модальное окно
        modal.classList.remove('active');
    }

    // Возврат к выбору категорий
    function showCategories() {
        modal.querySelector('h2').textContent = 'Выберите тип актива';
        const content = modal.querySelector('.asset-categories');
        content.innerHTML = `
            <div class="category-card" data-category="stocks">
                <i class="fas fa-chart-line"></i>
                <h3>Акции</h3>
                <p>Инвестиции в ценные бумаги</p>
            </div>
            <div class="category-card" data-category="realestate">
                <i class="fas fa-home"></i>
                <h3>Недвижимость</h3>
                <p>Дома, квартиры, офисы</p>
            </div>
            <div class="category-card" data-category="business">
                <i class="fas fa-store"></i>
                <h3>Бизнес</h3>
                <p>Малый и средний бизнес</p>
            </div>
            <div class="category-card" data-category="preciousmetals">
                <i class="fas fa-coins"></i>
                <h3>Драгоценные металлы</h3>
                <p>Золотые монеты и слитки</p>
            </div>
            <div class="category-card" data-category="misc">
                <i class="fas fa-shopping-bag"></i>
                <h3>Всякая всячина</h3>
                <p>Прочие покупки</p>
            </div>
        `;

        // Восстанавливаем обработчики для категорий
        content.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                showCategoryItems(category);
            });
        });
    }

    // Открытие модального окна
    buyBtn.addEventListener('click', () => {
        modal.classList.add('active');
        showCategories();
    });

    // Закрытие модального окна
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Инициализация обработчиков для кнопок покупки
    function initializeBuyButtons() {
        const buyButtons = document.querySelectorAll('.buy-button, .buy-stock-btn, .buy-metal-btn, .buy-misc-btn, .buy-property-btn');
        
        buyButtons.forEach(button => {
            // Добавляем обработчик для touchstart
            button.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.style.opacity = '0.7';
                // Вызываем соответствующую функцию покупки
                const card = this.closest('.asset-card');
                if (card) {
                    const itemId = card.dataset.itemId;
                    const item = findItemById(itemId);
                    if (item) {
                        showAssetDetails(item, getCurrentCategory());
                    }
                }
            });

            // Добавляем обработчик для touchend
            button.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.style.opacity = '1';
            });

            // Улучшаем отзывчивость на мобильных
            button.style.cursor = 'pointer';
            button.style.touchAction = 'manipulation';
        });
    }

    // Вспомогательная функция для поиска элемента по ID
    function findItemById(id) {
        for (const category in ASSET_CATEGORIES) {
            const items = ASSET_CATEGORIES[category].items;
            const item = items.find(i => i.id === id);
            if (item) return item;
        }
        return null;
    }

    // Вспомогательная функция для получения текущей категории
    function getCurrentCategory() {
        const activeCard = document.querySelector('.category-card.active');
        return activeCard ? activeCard.dataset.category : null;
    }

    // Вызываем инициализацию при показе категорий и элементов
    const originalShowCategories = showCategories;
    showCategories = function() {
        originalShowCategories();
        initializeBuyButtons();
    };

    const originalShowCategoryItems = showCategoryItems;
    showCategoryItems = function(category) {
        originalShowCategoryItems(category);
        initializeBuyButtons();
    };

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
        });
    }

    // Инициализируем обработчики при загрузке
    const numericInputs = modal.querySelectorAll('input[type="number"]');
    numericInputs.forEach(setupNumericInput);
})(); 