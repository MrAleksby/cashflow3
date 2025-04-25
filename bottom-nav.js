document.addEventListener('DOMContentLoaded', function() {
  var navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(function(btn) {
    btn.onclick = function() {
      var screen = btn.getAttribute('data-screen');
      var screens = document.querySelectorAll('.screen');
      screens.forEach(function(s) { s.classList.remove('active'); });
      var targetScreen = document.getElementById('screen-' + screen);
      if (targetScreen) targetScreen.classList.add('active');
      navBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');

      // Если это кнопка 'Поток', закрываем все выпадающие меню и модалки
      if (screen === 'cashflow') {
        var dropdowns = document.querySelectorAll('.dropdown, .modal');
        dropdowns.forEach(function(d) { d.style.display = 'none'; });
      }
    };
  });
}); 