document.addEventListener('DOMContentLoaded', function() {
  const tgBtn = document.createElement('a');
  tgBtn.id = 'telegram-btn';
  tgBtn.href = 'https://t.me/LTYH2';
  tgBtn.target = '_blank';
  tgBtn.title = 'Перейти в Telegram чат';
  tgBtn.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#37aee2"/>
      <path d="M23.5 9.5L8.5 15.5C7.83333 15.8333 7.83333 16.6667 8.5 17L12.5 18.5L14 22.5C14.1667 22.8333 14.6667 22.8333 14.8333 22.5L16.5 19.5L20.5 21.5C21.1667 21.8333 21.8333 21.5 22 20.8333L24.5 10.5C24.6667 9.83333 24 9.16667 23.5 9.5Z" fill="#fff"/>
    </svg>
  `;
  document.body.appendChild(tgBtn);
}); 