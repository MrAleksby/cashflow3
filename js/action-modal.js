document.addEventListener('DOMContentLoaded', function() {
    // Проверяем и инициализируем необходимые глобальные переменные
    if (typeof window.cash === 'undefined') {
        window.cash = 0;
    }
    if (typeof window.data === 'undefined') {
        window.data = {};
    }
    if (typeof window.data.history === 'undefined') {
        window.data.history = [];
    }
    if (typeof window.data.children === 'undefined') {
        window.data.children = [];
    }
    if (typeof window.renderCash !== 'function') {
        window.renderCash = function() {
            const topCashAmount = document.getElementById('top-cash-amount');
            if (topCashAmount) {
                topCashAmount.textContent = window.cash;
            }
        };
    }

    const actionModal = document.getElementById('action-modal');
    if (!actionModal) {
        console.error('Не найден элемент action-modal');
        return;
    }

    // Получаем элементы для работы с детьми
    const childNameInput = actionModal.querySelector('.child-name');
    const childExpenseInput = actionModal.querySelector('.child-expense');
    const addChildBtn = actionModal.querySelector('.add-child-btn');
    const childrenList = actionModal.querySelector('.children-list');

    // Получаем остальные элементы модального окна
    const closeBtn = actionModal.querySelector('.close-btn');
    const takeMoneyBtn = actionModal.querySelector('.take-money-btn');
    const giveMoneyBtn = actionModal.querySelector('.give-money-btn');
    const takeMoneyAmount = actionModal.querySelector('.take-money-amount');
    const giveMoneyAmount = actionModal.querySelector('.give-money-amount');
    const takeMoneyDescription = actionModal.querySelector('.take-money-description');
    const giveMoneyDescription = actionModal.querySelector('.give-money-description');
    const walletAmount = actionModal.querySelector('#modal-action-wallet-amount');

    // Проверяем, что все элементы найдены
    if (!closeBtn || !takeMoneyBtn || !giveMoneyBtn || !takeMoneyAmount || 
        !giveMoneyAmount || !takeMoneyDescription || !giveMoneyDescription || !walletAmount ||
        !childNameInput || !childExpenseInput || !addChildBtn || !childrenList) {
        console.error('Не найдены необходимые элементы в модальном окне');
        return;
    }

    // Функция для обновления списка детей
    function updateChildrenList() {
        childrenList.innerHTML = '';
        window.data.children.forEach((child, index) => {
            const childItem = document.createElement('div');
            childItem.className = 'child-item';
            childItem.innerHTML = `
                <div class="child-info">
                    <div class="child-name">${child.name}</div>
                    <div class="child-expense">Расход: $${child.expense}/мес</div>
                </div>
                <button class="remove-child-btn" data-index="${index}">Удалить</button>
            `;
            childrenList.appendChild(childItem);
        });

        // Добавляем обработчики для кнопок удаления
        const removeButtons = childrenList.querySelectorAll('.remove-child-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                removeChild(index);
            });
        });
    }

    // Функция добавления ребенка
    function addChild() {
        const name = childNameInput.value.trim();
        const expense = parseFloat(childExpenseInput.value);

        if (!name) {
            alert('Введите имя ребенка!');
            return;
        }

        if (!expense || expense < 0) {
            alert('Введите корректную сумму расхода!');
            return;
        }

        // Создаем уникальный ID для расхода
        const expenseId = 'child_' + Date.now();

        // Добавляем ребенка в список
        window.data.children.push({
            name: name,
            expense: expense,
            expenseId: expenseId
        });

        // Добавляем расход
        if (!window.data.expense) window.data.expense = [];
        window.data.expense.push({
            id: expenseId,
            name: `Расходы на ребенка: ${name}`,
            value: expense
        });

        // Обновляем отображение
        updateChildrenList();
        
        // Обновляем все отображения расходов
        if (typeof window.renderExpense === 'function') {
            window.renderExpense();
        }
        
        // Обновляем сумму расходов в финансовой формуле
        if (typeof window.renderSummary === 'function') {
            window.renderSummary();
        }

        // Сохраняем изменения
        if (typeof window.autoSave === 'function') {
            window.autoSave();
        }

        // Очищаем поля ввода
        childNameInput.value = '';
        childExpenseInput.value = '';

        // Показываем сообщение об успехе
        alert(`Ребенок ${name} успешно добавлен с ежемесячным расходом $${expense}`);
    }

    // Функция удаления ребенка
    function removeChild(index) {
        const child = window.data.children[index];
        if (!confirm(`Вы уверены, что хотите удалить ребенка ${child.name}?`)) {
            return;
        }

        // Удаляем связанный расход
        if (window.data.expense) {
            const expenseIndex = window.data.expense.findIndex(exp => exp.id === child.expenseId);
            if (expenseIndex !== -1) {
                window.data.expense.splice(expenseIndex, 1);
            }
        }

        // Удаляем ребенка из списка
        window.data.children.splice(index, 1);

        // Обновляем отображение
        updateChildrenList();
        
        // Обновляем все отображения расходов
        if (typeof window.renderExpense === 'function') {
            window.renderExpense();
        }
        
        // Обновляем сумму расходов в финансовой формуле
        if (typeof window.renderSummary === 'function') {
            window.renderSummary();
        }

        // Сохраняем изменения
        if (typeof window.autoSave === 'function') {
            window.autoSave();
        }
    }

    // Открытие модального окна
    window.openActionModal = function() {
        actionModal.style.display = 'block';
        updateModalWalletAmount();
        updateChildrenList();
        clearInputs();
    };

    // Закрытие модального окна
    function closeActionModal() {
        actionModal.style.display = 'none';
        clearInputs();
    }

    // Обновление отображения суммы в кошельке
    function updateModalWalletAmount() {
        walletAmount.textContent = `$${window.cash || 0}`;
    }

    // Очистка полей ввода
    function clearInputs() {
        takeMoneyAmount.value = '';
        giveMoneyAmount.value = '';
        takeMoneyDescription.value = '';
        giveMoneyDescription.value = '';
        childNameInput.value = '';
        childExpenseInput.value = '';
    }

    // Взять деньги
    function takeMoney() {
        const amount = parseFloat(takeMoneyAmount.value);
        const description = takeMoneyDescription.value.trim();

        if (!amount || amount <= 0) {
            alert('Введите корректную сумму!');
            return;
        }

        if (!description) {
            alert('Введите описание!');
            return;
        }

        // Подтверждение
        if (!confirm(`Подтвердите получение:\n$${amount}\nОписание: ${description}`)) {
            return;
        }

        // Добавляем деньги в кошелек
        window.cash += amount;

        // Добавляем в историю
        window.data.history.push({
            type: 'take',
            amount: amount,
            description: description,
            date: new Date().toISOString()
        });

        // Обновляем отображение
        window.renderCash();
        updateModalWalletAmount();
        clearInputs();

        // Сохраняем изменения
        if (typeof window.autoSave === 'function') {
            window.autoSave();
        }
    }

    // Отдать деньги
    function giveMoney() {
        const amount = parseFloat(giveMoneyAmount.value);
        const description = giveMoneyDescription.value.trim();

        if (!amount || amount <= 0) {
            alert('Введите корректную сумму!');
            return;
        }

        if (!description) {
            alert('Введите описание!');
            return;
        }

        if (amount > window.cash) {
            alert('Недостаточно денег в кошельке!');
            return;
        }

        // Подтверждение
        if (!confirm(`Подтвердите передачу:\n$${amount}\nОписание: ${description}`)) {
            return;
        }

        // Вычитаем деньги из кошелька
        window.cash -= amount;

        // Добавляем в историю
        window.data.history.push({
            type: 'give',
            amount: amount,
            description: description,
            date: new Date().toISOString()
        });

        // Обновляем отображение
        window.renderCash();
        updateModalWalletAmount();
        clearInputs();

        // Сохраняем изменения
        if (typeof window.autoSave === 'function') {
            window.autoSave();
        }
    }

    // Добавляем обработчики событий
    closeBtn.addEventListener('click', closeActionModal);
    takeMoneyBtn.addEventListener('click', takeMoney);
    giveMoneyBtn.addEventListener('click', giveMoney);
    addChildBtn.addEventListener('click', addChild);

    // Закрытие по клику вне модального окна
    window.addEventListener('click', function(event) {
        if (event.target === actionModal) {
            closeActionModal();
        }
    });

    // Добавляем обработчик для кнопки действия в основном интерфейсе
    const mainActionBtn = document.getElementById('main-action-btn');
    if (mainActionBtn) {
        mainActionBtn.addEventListener('click', openActionModal);
    } else {
        console.error('Не найдена кнопка main-action-btn');
    }
}); 