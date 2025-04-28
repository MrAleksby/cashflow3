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

    // Кнопка действие - пока без функционала
    var actionBtn = document.getElementById('main-action-btn');

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
      let value = 0;
      let displayText = '';
      
      if (a.type === 'stocks') {
        // Для акций показываем количество и цену за штуку
        value = a.quantity * a.price;
        displayText = `${a.name} (${a.quantity} шт. по $${a.price}/шт)`;
      } else {
        // Для остальных активов показываем просто значение
        value = Number(a.value) || 0;
        displayText = a.name;
      }
      
      total += value;
      return `<li>${displayText} <span style='float:right;'>$${value}</span></li>`;
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

  // Инициализация данных при загрузке
  if (typeof window.data !== 'object' || !window.data) window.data = {};
  if (!Array.isArray(window.data.asset)) window.data.asset = [];
  if (!Array.isArray(window.data.income)) window.data.income = [];
  if (!Array.isArray(window.data.expense)) window.data.expense = [];
  if (!Array.isArray(window.data.liability)) window.data.liability = [];

  // Функция расчета дивидендов
  window.calculateDividends = function(stockName, quantity) {
    const dividendRates = {
      '2BIGPOWER': 100, // $100 за акцию
      'CD': 50         // $50 за акцию
    };
    
    return (dividendRates[stockName] || 0) * quantity;
  };
})(); 