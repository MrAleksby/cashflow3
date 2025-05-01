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
    if (typeof window.data.job === 'undefined') {
        window.data.job = {
            title: '',
            salary: 0
        };
    }

    // Инициализируем отображение зарплаты
    const salaryValue = document.getElementById('salary-value');
    if (salaryValue) {
        salaryValue.textContent = window.data.job.salary;
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

    const actionCards = actionModal.querySelectorAll('.category-card');
    let activeCard = null;

    // Получаем элементы для работы с детьми
    const childNameInput = actionModal.querySelector('.child-name');
    const childExpenseInput = actionModal.querySelector('.child-expense');
    const addChildBtn = actionModal.querySelector('.add-child-btn');
    const childrenList = actionModal.querySelector('.children-list');

    // Получаем элементы для работы с кредитом
    const loanAmountInput = actionModal.querySelector('.loan-amount');
    const loanDescriptionInput = actionModal.querySelector('.loan-description');
    const takeLoanBtn = actionModal.querySelector('.take-loan-btn');

    // Получаем остальные элементы модального окна
    const closeBtn = actionModal.querySelector('.close-btn');
    const takeMoneyBtn = actionModal.querySelector('.take-money-btn');
    const giveMoneyBtn = actionModal.querySelector('.give-money-btn');
    const takeMoneyAmount = actionModal.querySelector('.take-money-amount');
    const giveMoneyAmount = actionModal.querySelector('.give-money-amount');
    const takeMoneyDescription = actionModal.querySelector('.take-money-description');
    const giveMoneyDescription = actionModal.querySelector('.give-money-description');
    const walletAmount = actionModal.querySelector('#modal-action-wallet-amount');

    // Получаем элементы для работы с работой
    const jobSalaryInput = actionModal.querySelector('.job-salary');
    const jobTitleInput = actionModal.querySelector('.job-title');
    const setJobBtn = actionModal.querySelector('.set-job-btn');

    // Проверяем, что все элементы найдены
    if (!closeBtn || !takeMoneyBtn || !giveMoneyBtn || !takeMoneyAmount || 
        !giveMoneyAmount || !takeMoneyDescription || !giveMoneyDescription || !walletAmount ||
        !childNameInput || !childExpenseInput || !addChildBtn || !childrenList ||
        !loanAmountInput || !loanDescriptionInput || !takeLoanBtn ||
        !jobSalaryInput || !jobTitleInput || !setJobBtn) {
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

        // Добавляем запись в историю
        if (!window.data.history) window.data.history = [];
        window.data.history.push({
            type: 'expense',
            description: `Добавлен ребенок: ${name}`,
            amount: expense,
            date: new Date().toISOString()
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

        // Обновляем историю
        if (typeof window.renderHistory === 'function') {
            window.renderHistory();
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

    // Функция взятия кредита
    function takeLoan() {
        const amount = parseFloat(loanAmountInput.value);
        const description = loanDescriptionInput.value.trim();

        // Валидация
        if (!amount || amount <= 0) {
            alert('Введите корректную сумму кредита!');
            return;
        }

        if (amount % 1000 !== 0) {
            alert('Сумма кредита должна быть кратна $1000!');
            return;
        }

        if (!description) {
            alert('Введите описание (цель) кредита!');
            return;
        }

        // Подтверждение
        const monthlyPayment = amount * 0.1;
        if (!confirm(`Подтвердите получение кредита:\nСумма: $${amount}\nЕжемесячный платеж: $${monthlyPayment}\nЦель: ${description}`)) {
            return;
        }

        // Добавляем деньги в кошелек
        window.cash += amount;

        // Добавляем в пассивы
        if (!window.data.liability) window.data.liability = [];
        window.data.liability.push({
            id: `loan-${Date.now()}`,
            name: `Кредит: ${description}`,
            value: amount,
            type: 'loan'
        });

        // Добавляем ежемесячный расход
        if (!window.data.expense) window.data.expense = [];
        window.data.expense.push({
            id: `loan-payment-${Date.now()}`,
            name: `Платеж по кредиту: ${description}`,
            value: monthlyPayment,
            type: 'loan'
        });

        // Добавляем в историю
        window.data.history.push({
            type: 'loan',
            description: 'Кредит',
            amount: amount,
            date: new Date().toISOString()
        });

        // Обновляем отображение
        window.renderCash();
        window.renderLiability();
        window.renderExpenses();
        window.renderSummary();
        window.renderHistory();
        updateModalWalletAmount();
        
        // Сохраняем изменения
        if (typeof window.autoSave === 'function') {
            window.autoSave();
        }

        // Очищаем поля
        loanAmountInput.value = '';
        loanDescriptionInput.value = '';

        // Показываем сообщение об успехе
        alert(`Кредит успешно получен!\nСумма: $${amount}\nЕжемесячный платеж: $${monthlyPayment}`);
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
            
            // Просто обновляем значение без принудительного blur/focus
            e.target.value = value;
        });
        
        // Добавляем обработчик для финальной валидации при завершении ввода
        input.addEventListener('change', function(e) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            e.target.value = value;
        });
    }

    // Настраиваем все числовые поля в модальном окне
    function setupAllNumericInputs() {
        // Поля для взятия/отдачи денег
        setupNumericInput(takeMoneyAmount);
        setupNumericInput(giveMoneyAmount);
        
        // Поля для детей
        setupNumericInput(childExpenseInput);
        
        // Поля для кредита
        setupNumericInput(loanAmountInput);
        
        // Поля для работы
        setupNumericInput(jobSalaryInput);
    }

    // Открытие модального окна
    window.openActionModal = function() {
        actionModal.style.display = 'block';
        updateModalWalletAmount();
        updateChildrenList();
        clearInputs();
        setupAllNumericInputs(); // Настраиваем числовые поля при открытии окна
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
        loanAmountInput.value = '';
        loanDescriptionInput.value = '';
        jobSalaryInput.value = '';
        jobTitleInput.value = '';
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

    // Функция установки работы
    function setJob() {
        const title = jobTitleInput.value.trim();
        const salary = parseInt(jobSalaryInput.value);

        if (!title || !salary) {
            alert('Заполните все поля!');
            return;
        }

        // Удаляем старую работу из доходов
        window.data.income = window.data.income.filter(inc => inc.type !== 'job');

        // Добавляем новую работу в доходы
        window.data.income.push({
            name: title,
            value: salary,
            type: 'job'
        });

        // Добавляем запись в историю
        if (!window.data.history) window.data.history = [];
        window.data.history.push({
            type: 'job',
            amount: salary,
            date: new Date().toISOString()
        });

        // Очищаем поля ввода
        jobTitleInput.value = '';
        jobSalaryInput.value = '';

        // Обновляем отображение
        window.renderIncome();
        window.renderSummary();
        window.renderHistory();
        autoSave();

        // Обновляем состояние кнопки "Уволиться"
        updateQuitJobButton();

        alert(`Устроились на работу: ${title}\nЗарплата: $${salary}`);
    }

    function quitJob() {
        if (!confirm('Вы уверены, что хотите уволиться с работы?')) {
            return;
        }

        // Удаляем работу из доходов
        window.data.income = window.data.income.filter(inc => inc.type !== 'job');

        // Обновляем отображение
        window.renderIncome();
        window.renderSummary();
        autoSave();

        // Обновляем состояние кнопки "Уволиться"
        updateQuitJobButton();

        alert('Вы уволились с работы');
    }

    function updateQuitJobButton() {
        const quitBtn = document.getElementById('quit-job-btn');
        const hasJob = window.data.income && window.data.income.some(inc => inc.type === 'job');
        
        if (quitBtn) {
            quitBtn.disabled = !hasJob;
        }
    }

    // Инициализация кнопки "Уволиться"
    const jobSection = document.querySelector('.action-card[data-action="job"] .action-info');
    if (jobSection) {
        // Создаем кнопку "Уволиться"
        const quitBtn = document.createElement('button');
        quitBtn.id = 'quit-job-btn';
        quitBtn.className = 'btn btn-danger quit-job-btn';
        quitBtn.textContent = 'Уволиться';
        quitBtn.onclick = quitJob;
        quitBtn.disabled = true; // По умолчанию кнопка неактивна

        // Добавляем кнопку после существующих элементов
        jobSection.appendChild(quitBtn);

        // Инициализируем состояние кнопки
        updateQuitJobButton();
    }

    // Добавляем обработчики событий
    closeBtn.addEventListener('click', closeActionModal);
    takeMoneyBtn.addEventListener('click', takeMoney);
    giveMoneyBtn.addEventListener('click', giveMoney);
    addChildBtn.addEventListener('click', addChild);
    takeLoanBtn.addEventListener('click', takeLoan);
    setJobBtn.addEventListener('click', setJob);

    // Добавляем обработчики для мобильных устройств
    takeLoanBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        takeLoan();
    });
    setJobBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        setJob();
    });

    // Обработка кликов по карточкам
    actionCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Игнорируем клик, если он произошел на форме или её элементах
            if (e.target.closest('.action-form')) {
                return;
            }

            console.log('Card clicked:', card.dataset.category);
            
            // Сначала деактивируем все карточки
            actionCards.forEach(c => {
                if (c !== card) {
                    c.classList.remove('active');
                    const form = c.querySelector('.action-form');
                    if (form) {
                        form.style.display = 'none';
                    }
                }
            });

            // Переключаем состояние текущей карточки
            const form = card.querySelector('.action-form');
            if (form) {
                const isActive = card.classList.toggle('active');
                form.style.display = isActive ? 'block' : 'none';
                
                if (isActive) {
                    // Фокусируемся на первом поле ввода
                    const firstInput = form.querySelector('input');
                    if (firstInput) {
                        setTimeout(() => {
                            firstInput.focus();
                        }, 100);
                    }
                }
            }
        });
    });

    // Предотвращаем закрытие модального окна при клике на его содержимое
    actionModal.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Закрываем модальное окно при клике вне его содержимого
    actionModal.addEventListener('click', function(e) {
        if (e.target === actionModal) {
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

    // Автоматическая прокрутка при открытии клавиатуры
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            setTimeout(() => {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });

    // Обработчик ввода суммы кредита
    if (loanAmountInput) {
        loanAmountInput.addEventListener('input', function(e) {
            // Удаляем все нецифровые символы
            let value = e.target.value.replace(/[^0-9]/g, '');
            
            // Ограничиваем длину до 10 цифр
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            
            // Обновляем значение поля
            e.target.value = value;
        });
    }
}); 