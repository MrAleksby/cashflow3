// Модуль истории операций
(function() {
  // Инициализация истории из локального хранилища
  let history = JSON.parse(localStorage.getItem('cashflowHistory') || '[]');

  // Добавление записи в историю
  window.addHistory = function(type, assetType, name, amount, details = '') {
    const entry = {
      type,
      assetType,
      name,
      amount,
      date: new Date().toLocaleString(),
      details
    };
    history.unshift(entry);
    if (history.length > 100) history = history.slice(0, 100); // максимум 100 записей
    localStorage.setItem('cashflowHistory', JSON.stringify(history));
    renderHistory();
  };

  // Отрисовка истории
  window.renderHistory = function() {
    const container = document.getElementById('history-container');
    if (!container) return;
    
    if (history.length === 0) {
      container.innerHTML = '<div class="history-empty">История операций пуста</div>';
      return;
    }

    container.innerHTML = history.map(function(entry) {
      let icon, color;
      switch (entry.type) {
        case 'buy':
          icon = '🛒';
          color = '#4caf50';
          break;
        case 'sell':
          icon = '💰';
          color = '#2196f3';
          break;
        case 'expense':
          icon = '📉';
          color = '#f44336';
          break;
        case 'income':
          icon = '📈';
          color = '#4caf50';
          break;
        default:
          icon = '📝';
          color = '#9e9e9e';
      }

      return `
        <div class="history-entry" style="border-left: 4px solid ${color}">
          <div class="history-icon">${icon}</div>
          <div class="history-content">
            <div class="history-details">
              <b>${getTypeText(entry.type)}</b> — ${entry.assetType} 
              <span style="color:#1976d2;">${entry.name}</span> 
              на сумму <b>${entry.amount}</b>
              ${entry.details ? `<br><span style='font-size:0.95em;color:#555;'>${entry.details}</span>` : ''}
            </div>
            <div class="history-timestamp">${entry.date}</div>
          </div>
          <div class="history-actions">
            <button onclick="editHistoryEntry(${history.indexOf(entry)})" title="Редактировать">✏️</button>
            <button onclick="deleteHistoryEntry(${history.indexOf(entry)})" title="Удалить">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  };

  // Получение текста типа операции
  function getTypeText(type) {
    switch (type) {
      case 'buy': return 'Покупка';
      case 'sell': return 'Продажа';
      case 'expense': return 'Расход';
      case 'income': return 'Доход';
      default: return type;
    }
  }

  // Редактирование записи
  window.editHistoryEntry = function(idx) {
    const entry = history[idx];
    if (!entry) return;
    
    openModal('edit-history-modal');
    
    const form = document.getElementById('edit-history-form');
    if (form) {
      document.getElementById('edit-history-type').value = getTypeText(entry.type);
      document.getElementById('edit-history-assetType').value = entry.assetType;
      document.getElementById('edit-history-name').value = entry.name;
      document.getElementById('edit-history-amount').value = entry.amount;
      document.getElementById('edit-history-details').value = entry.details || '';
      
      form.onsubmit = function(e) {
        e.preventDefault();
        entry.name = document.getElementById('edit-history-name').value;
        entry.amount = Number(document.getElementById('edit-history-amount').value);
        entry.details = document.getElementById('edit-history-details').value;
        localStorage.setItem('cashflowHistory', JSON.stringify(history));
        renderHistory();
        closeModal('edit-history-modal');
      };
    }
  };

  // Удаление записи
  window.deleteHistoryEntry = function(idx) {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return;
    history.splice(idx, 1);
    localStorage.setItem('cashflowHistory', JSON.stringify(history));
    renderHistory();
  };

  // Очистка всей истории
  window.clearHistory = function() {
    if (!confirm('Вы уверены, что хотите очистить всю историю?')) return;
    history = [];
    localStorage.setItem('cashflowHistory', '[]');
    renderHistory();
  };

  // Инициализация при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
    renderHistory();
    
    // Обработчик кнопки истории
    const historyBtn = document.getElementById('history-btn');
    const screenHistory = document.getElementById('screen-history');
    const screens = document.querySelectorAll('.screen');
    
    if (historyBtn && screenHistory) {
      historyBtn.onclick = function() {
        screens.forEach(function(s) { s.classList.remove('active'); });
        screenHistory.classList.add('active');
      };
    }
  });
})(); 