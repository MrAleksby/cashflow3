// Калькулятор с поддержкой процентов
(function() {
  let display = document.getElementById('calc-display');
  let currentValue = '';
  let previousValue = '';
  let operation = null;
  let shouldResetDisplay = false;

  // Инициализация калькулятора
  document.addEventListener('DOMContentLoaded', function() {
    // Добавляем обработчики для кнопок с цифрами и операциями
    document.querySelectorAll('.calc-btn').forEach(function(button) {
      button.addEventListener('click', function() {
        const value = this.dataset.value;
        if (value) {
          handleInput(value);
        }
      });
    });

    // Кнопка очистки
    document.getElementById('calc-clear').addEventListener('click', clear);

    // Кнопка равно
    document.getElementById('calc-equals').addEventListener('click', calculate);

    // Кнопка процента
    document.getElementById('calc-percent').addEventListener('click', handlePercent);

    // Кнопка копирования результата
    document.getElementById('calc-copy').addEventListener('click', function() {
      if (display.value) {
        navigator.clipboard.writeText(display.value).then(function() {
          this.textContent = 'Скопировано!';
          setTimeout(() => {
            this.textContent = 'Скопировать результат';
          }, 2000);
        }.bind(this));
      }
    });
  });

  function handleInput(value) {
    if ('0123456789.'.includes(value)) {
      if (shouldResetDisplay) {
        currentValue = value;
        shouldResetDisplay = false;
      } else {
        if (value === '.' && currentValue.includes('.')) return;
        currentValue += value;
      }
      display.value = currentValue;
    } else if ('+-*/'.includes(value)) {
      if (currentValue === '' && previousValue === '') return;
      
      if (operation && currentValue !== '') {
        calculate();
      }
      
      operation = value;
      previousValue = currentValue;
      currentValue = '';
    }
  }

  function calculate() {
    if (previousValue === '' || currentValue === '' || !operation) return;

    let result;
    const prev = parseFloat(previousValue);
    const curr = parseFloat(currentValue);

    switch (operation) {
      case '+':
        result = prev + curr;
        break;
      case '-':
        result = prev - curr;
        break;
      case '*':
        result = prev * curr;
        break;
      case '/':
        if (curr === 0) {
          display.value = 'Ошибка деления на ноль';
          clear();
          return;
        }
        result = prev / curr;
        break;
    }

    result = Math.round(result * 100) / 100;
    display.value = result;
    previousValue = result.toString();
    currentValue = '';
    operation = null;
    shouldResetDisplay = true;
  }

  function handlePercent() {
    if (currentValue === '') return;
    
    const value = parseFloat(currentValue);
    if (previousValue === '') {
      currentValue = (value / 100).toString();
    } else {
      currentValue = ((parseFloat(previousValue) * value) / 100).toString();
    }
    display.value = currentValue;
  }

  function clear() {
    currentValue = '';
    previousValue = '';
    operation = null;
    display.value = '';
    shouldResetDisplay = false;
  }
})(); 