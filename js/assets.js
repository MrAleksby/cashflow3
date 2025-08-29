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
  });

  // Функция-обертка для автоматического сохранения после рендеринга
  function wrapWithAutoSave(renderFunction) {
    return function(...args) {
      renderFunction.apply(this, args);
      if (typeof window.autoSave === 'function') {
        window.autoSave();
      }
    };
  }

  // === ОТРИСОВКА АКТИВОВ ===
  const originalRenderAll = function() {
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
        value = a.quantity * a.price;
        displayText = `${a.name} (${a.quantity} шт. × $${a.price.toFixed(1)} = $${value})`;
      } else {
        value = Number(a.value) || 0;
        displayText = a.name;
      }
      
      total += value;
      return `<li>${displayText} <span style='float:right;'>$${value}</span></li>`;
    }).join('');
    if (assetTotal) assetTotal.textContent = total;
  };

  // === ОТРИСОВКА ДОХОДОВ ===
  const originalRenderIncome = function() {
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
  const originalRenderExpense = function() {
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
  const originalRenderLiability = function() {
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
  const originalRenderCash = function() {
    var cashElem = document.getElementById('top-cash-amount');
    var cash = Number(window.cash);
    if (isNaN(cash)) cash = 0;
    if (cashElem) cashElem.textContent = cash;
  };

  // Оборачиваем все функции рендеринга в автосохранение
  window.renderAll = wrapWithAutoSave(originalRenderAll);
  window.renderIncome = wrapWithAutoSave(originalRenderIncome);
  window.renderExpense = wrapWithAutoSave(originalRenderExpense);
  window.renderLiability = wrapWithAutoSave(originalRenderLiability);
  window.renderCash = wrapWithAutoSave(originalRenderCash);

  // Инициализация данных при загрузке
  if (typeof window.data !== 'object' || !window.data) window.data = {};
  if (!Array.isArray(window.data.asset)) window.data.asset = [];
  if (!Array.isArray(window.data.income)) window.data.income = [];
  if (!Array.isArray(window.data.expense)) window.data.expense = [];
  if (!Array.isArray(window.data.liability)) window.data.liability = [];

  // Функция расчета дивидендов
  window.calculateDividends = function(stockName, quantity) {
    const dividendRates = {
      '2BIGPOWER': 100,
      'CD': 50
    };
    
    return (dividendRates[stockName] || 0) * quantity;
  };
})(); 