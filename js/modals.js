// Функции для работы с модальными окнами
(function() {
  // Общая функция для открытия любого модального окна
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  };

  // Общая функция для закрытия любого модального окна
  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  };

  // Закрытие модального окна при клике вне его области
  document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal') && event.target.classList.contains('active')) {
      event.target.classList.remove('active');
    }
  });

  // Инициализация кнопок закрытия
  document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики для всех кнопок закрытия
    document.querySelectorAll('.close-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const modal = btn.closest('.modal');
        if (modal) {
          modal.classList.remove('active');
        }
      });
    });

    // Модальное окно истории изменений
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
      historyBtn.addEventListener('click', function() {
        openModal('edit-history-modal');
      });
    }

    // Модальное окно калькулятора
    const calculatorBtn = document.getElementById('calculator-btn');
    if (calculatorBtn) {
      calculatorBtn.addEventListener('click', function() {
        openModal('calculator-modal');
      });
    }

    // Модальное окно имени игрока
    const playerNameBtn = document.getElementById('player-name-btn');
    if (playerNameBtn) {
      playerNameBtn.addEventListener('click', function() {
        openModal('player-name-modal');
      });
    }

    // Модальное окно банкротства - может быть вызвано программно
    window.showBankruptModal = function() {
      openModal('bankrupt-modal');
    };
  });
})(); 