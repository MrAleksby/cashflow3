// Модуль активов и пассивов
(function(){
  // === ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ КНОПОК ===
  document.addEventListener('DOMContentLoaded', function() {
    // Показываем экран cashflow по умолчанию
    var screens = document.querySelectorAll('.screen');
    var cashflowScreen = document.getElementById('screen-cashflow');
    if (cashflowScreen) {
      screens.forEach(function(s) { s.classList.remove('active'); });
      cashflowScreen.classList.add('active');
    }

    // === ИНИЦИАЛИЗАЦИЯ КОШЕЛЬКА ===
    if (typeof window.cash !== 'number' || isNaN(window.cash)) window.cash = 0;

    // Кнопки купить/продать/действие - пока без функционала
    var buyBtn = document.getElementById('main-buy-btn');
    var sellBtn = document.getElementById('main-sell-btn');
    var actionBtn = document.getElementById('main-action-btn');

    if (buyBtn) {
      buyBtn.addEventListener('click', function() {
        console.log('Купить - функционал временно отключен');
      });
    }

    if (sellBtn) {
      sellBtn.addEventListener('click', function() {
        console.log('Продать - функционал временно отключен');
      });
    }

    if (actionBtn) {
      actionBtn.addEventListener('click', function() {
        console.log('Действие - функционал временно отключен');
      });
    }
  });

  // === ОТРИСОВКА АКТИВОВ ===
  window.renderAll = function() {
    var assetList = document.getElementById('asset-list');
    var assetTotal = document.getElementById('asset-total');
    if (!assetList) return;
    if (!window.data || !Array.isArray(window.data.asset)) {
      assetList.innerHTML = '<li style="color:#888;">Нет активов</li>';
      if (assetTotal) assetTotal.textContent = '0';
      return;
    }
    if (window.data.asset.length === 0) {
      assetList.innerHTML = '<li style="color:#888;">Нет активов</li>';
      if (assetTotal) assetTotal.textContent = '0';
      return;
    }
    var total = 0;
    assetList.innerHTML = window.data.asset.map(function(a) {
      total += Number(a.value) || 0;
      return `<li>${a.name} <span style='float:right;'>${a.value}</span></li>`;
    }).join('');
    if (assetTotal) assetTotal.textContent = total;
  };

  // === ОТРИСОВКА ДОХОДОВ ===
  window.renderIncome = function() {
    var incomeList = document.getElementById('income-list');
    var incomeTotal = document.getElementById('income-total');
    if (!incomeList) return;
    if (!window.data || !Array.isArray(window.data.income)) {
      incomeList.innerHTML = '<li style="color:#888;">Нет доходов</li>';
      if (incomeTotal) incomeTotal.textContent = '0';
      return;
    }
    if (window.data.income.length === 0) {
      incomeList.innerHTML = '<li style="color:#888;">Нет доходов</li>';
      if (incomeTotal) incomeTotal.textContent = '0';
      return;
    }
    var total = 0;
    incomeList.innerHTML = window.data.income.map(function(a) {
      total += Number(a.value) || 0;
      return `<li>${a.name} <span style='float:right;'>${a.value}</span></li>`;
    }).join('');
    if (incomeTotal) incomeTotal.textContent = total;
  };

  // === ОТРИСОВКА РАСХОДОВ ===
  window.renderExpense = function() {
    var expenseList = document.getElementById('expense-list');
    var expenseTotal = document.getElementById('expense-total');
    if (!expenseList) return;
    if (!window.data || !Array.isArray(window.data.expense)) {
      expenseList.innerHTML = '<li style="color:#888;">Нет расходов</li>';
      if (expenseTotal) expenseTotal.textContent = '0';
      return;
    }
    if (window.data.expense.length === 0) {
      expenseList.innerHTML = '<li style="color:#888;">Нет расходов</li>';
      if (expenseTotal) expenseTotal.textContent = '0';
      return;
    }
    var total = 0;
    expenseList.innerHTML = window.data.expense.map(function(a) {
      total += Number(a.value) || 0;
      return `<li>${a.name} <span style='float:right;'>${a.value}</span></li>`;
    }).join('');
    if (expenseTotal) expenseTotal.textContent = total;
  };

  // === ОТРИСОВКА ПАССИВОВ ===
  window.renderLiability = function() {
    var liabilityList = document.getElementById('liability-list');
    var liabilityTotal = document.getElementById('liability-total');
    if (!liabilityList) return;
    if (!window.data || !Array.isArray(window.data.liability)) {
      liabilityList.innerHTML = '<li style="color:#888;">Нет пассивов</li>';
      if (liabilityTotal) liabilityTotal.textContent = '0';
      return;
    }
    if (window.data.liability.length === 0) {
      liabilityList.innerHTML = '<li style="color:#888;">Нет пассивов</li>';
      if (liabilityTotal) liabilityTotal.textContent = '0';
      return;
    }
    var total = 0;
    liabilityList.innerHTML = window.data.liability.map(function(a) {
      total += Number(a.value) || 0;
      return `<li>${a.name} <span style='float:right;'>${a.value}</span></li>`;
    }).join('');
    if (liabilityTotal) liabilityTotal.textContent = total;
  };

  // === ОТРИСОВКА КОШЕЛЬКА ===
  window.renderCash = function() {
    var cashElem = document.getElementById('top-cash-amount');
    var cash = Number(window.cash);
    if (isNaN(cash)) cash = 0;
    if (cashElem) cashElem.textContent = cash;
  };

  // === ОТРИСОВКА ФИНАНСОВОЙ ФОРМУЛЫ ===
  window.renderSummary = function() {
    var passiveElem = document.getElementById('passive-value');
    var incomeSumElem = document.getElementById('income-sum');
    var expenseSumElem = document.getElementById('expense-sum');
    var cashflowElem = document.getElementById('cashflow');
    var salaryElem = document.getElementById('salary-value');

    var passive = 0, incomeSum = 0, expenseSum = 0, salary = 0;
    if (window.data && Array.isArray(window.data.income)) {
      window.data.income.forEach(function(a) {
        if (a.name && a.name.startsWith('Пассивный доход')) passive += Number(a.value) || 0;
        if (a.name && a.name === 'Зарплата') salary += Number(a.value) || 0;
        incomeSum += Number(a.value) || 0;
      });
    }
    if (window.data && Array.isArray(window.data.expense)) {
      window.data.expense.forEach(function(a) {
        expenseSum += Number(a.value) || 0;
      });
    }
    if (passiveElem) passiveElem.textContent = passive;
    if (incomeSumElem) incomeSumElem.textContent = incomeSum;
    if (expenseSumElem) expenseSumElem.textContent = expenseSum;
    if (salaryElem) salaryElem.textContent = salary;
    if (cashflowElem) cashflowElem.textContent = incomeSum - expenseSum;
  };

  // Инициализация данных при загрузке
  if (typeof window.data !== 'object' || !window.data) window.data = {};
  if (!Array.isArray(window.data.asset)) window.data.asset = [];
  if (!Array.isArray(window.data.income)) window.data.income = [];
  if (!Array.isArray(window.data.expense)) window.data.expense = [];
  if (!Array.isArray(window.data.liability)) window.data.liability = [];
})();