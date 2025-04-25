// Обработка навигации
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Убираем активный класс у всех кнопок
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Добавляем активный класс нажатой кнопке
        item.classList.add('active');
        
        // Получаем название секции из data-атрибута
        const section = item.dataset.section;
        
        // Скрываем все экраны
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        
        // Показываем нужный экран
        const targetScreen = document.querySelector(`#screen-${section}`);
        if (targetScreen) {
            targetScreen.style.display = 'block';
        }
    });
}); 