#!/bin/bash

echo "🏆 Запуск турнирного сервера Cashflow..."
echo ""

# Проверяем, установлен ли Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не найден. Установите Python 3.9+"
    exit 1
fi

# Проверяем, установлена ли библиотека websockets
if ! python3 -c "import websockets" &> /dev/null; then
    echo "📦 Устанавливаем библиотеку websockets..."
    python3 -m pip install websockets
fi

echo "✅ Все зависимости установлены"
echo ""
echo "🚀 Запускаем турнирный сервер..."
echo ""
echo "📱 Участники: http://localhost:3000?tournament=true"
echo "👁️ Зрители: http://localhost:3000/spectator"
echo "🔌 WebSocket: ws://localhost:8765"
echo ""
echo "💡 Для остановки сервера нажмите Ctrl+C"
echo ""

# Запускаем сервер
python3 tournament_server.py


