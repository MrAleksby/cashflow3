const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Статические файлы
app.use(express.static('.'));
app.use('/spectator', express.static(path.join(__dirname, 'spectator')));

// Хранение данных турнира
const tournament = {
  players: new Map(), // ID участника -> данные
  spectators: new Set(), // ID зрителей
  startTime: null,
  isActive: false
};

// Маршрут для зрительской страницы
app.get('/spectator', (req, res) => {
  res.sendFile(path.join(__dirname, 'spectator', 'index.html'));
});

// WebSocket события
io.on('connection', (socket) => {
  console.log(`🔌 Новое подключение: ${socket.id}`);
  
  // Подключение участника к турниру
  socket.on('join-tournament', (playerData) => {
    console.log(`🎮 Участник присоединился: ${playerData.name}`);
    
    tournament.players.set(socket.id, {
      ...playerData,
      socketId: socket.id,
      lastUpdate: Date.now(),
      isOnline: true
    });
    
    // Уведомляем всех о новом участнике
    io.emit('player-joined', {
      ...playerData,
      socketId: socket.id,
      timestamp: Date.now()
    });
    
    // Отправляем текущее состояние турнира новому участнику
    socket.emit('tournament-state', {
      players: Array.from(tournament.players.values()),
      isActive: tournament.isActive,
      startTime: tournament.startTime
    });
  });
  
  // Обновление данных участника
  socket.on('player-update', (data) => {
    const player = tournament.players.get(socket.id);
    if (player) {
      const oldData = { ...player };
      Object.assign(player, data, { 
        lastUpdate: Date.now(),
        isOnline: true
      });
      
      console.log(`📊 Обновление участника ${player.name}: $${data.cash}`);
      
      // Отправляем обновление зрителям
      io.emit('player-updated', {
        playerId: socket.id,
        playerName: player.name,
        oldData: oldData,
        newData: data,
        timestamp: Date.now()
      });
    }
  });
  
  // Действие участника (покупка, продажа, PayDay)
  socket.on('player-action', (actionData) => {
    const player = tournament.players.get(socket.id);
    if (player) {
      console.log(`🎯 Действие участника ${player.name}: ${actionData.type}`);
      
      // Отправляем действие зрителям
      io.emit('player-action', {
        playerId: socket.id,
        playerName: player.name,
        action: actionData,
        timestamp: Date.now()
      });
    }
  });
  
  // Подключение зрителя
  socket.on('join-spectator', () => {
    console.log(`👁️ Зритель присоединился: ${socket.id}`);
    tournament.spectators.add(socket.id);
    
    // Отправляем текущее состояние турнира зрителю
    socket.emit('tournament-state', {
      players: Array.from(tournament.players.values()),
      isActive: tournament.isActive,
      startTime: tournament.startTime
    });
  });
  
  // Управление турниром
  socket.on('start-tournament', () => {
    tournament.isActive = true;
    tournament.startTime = Date.now();
    console.log('🏁 Турнир начался!');
    
    io.emit('tournament-started', {
      startTime: tournament.startTime,
      timestamp: Date.now()
    });
  });
  
  socket.on('stop-tournament', () => {
    tournament.isActive = false;
    console.log('🏁 Турнир завершен!');
    
    io.emit('tournament-stopped', {
      endTime: Date.now(),
      duration: tournament.startTime ? Date.now() - tournament.startTime : 0
    });
  });
  
  // Отключение
  socket.on('disconnect', () => {
    console.log(`🔌 Отключение: ${socket.id}`);
    
    // Если это участник
    if (tournament.players.has(socket.id)) {
      const player = tournament.players.get(socket.id);
      player.isOnline = false;
      player.lastUpdate = Date.now();
      
      console.log(`👋 Участник отключился: ${player.name}`);
      
      // Уведомляем зрителей
      io.emit('player-disconnected', {
        playerId: socket.id,
        playerName: player.name,
        timestamp: Date.now()
      });
    }
    
    // Если это зритель
    if (tournament.spectators.has(socket.id)) {
      tournament.spectators.delete(socket.id);
    }
  });
});

// API для получения статистики турнира
app.get('/api/tournament/stats', (req, res) => {
  const players = Array.from(tournament.players.values());
  const stats = {
    totalPlayers: players.length,
    onlinePlayers: players.filter(p => p.isOnline).length,
    totalCash: players.reduce((sum, p) => sum + (p.cash || 0), 0),
    totalAssets: players.reduce((sum, p) => sum + (p.assets?.length || 0), 0),
    isActive: tournament.isActive,
    startTime: tournament.startTime,
    duration: tournament.startTime ? Date.now() - tournament.startTime : 0
  };
  
  res.json(stats);
});

// API для получения списка участников
app.get('/api/tournament/players', (req, res) => {
  const players = Array.from(tournament.players.values()).map(p => ({
    id: p.socketId,
    name: p.name,
    cash: p.cash || 0,
    assets: p.assets || [],
    income: p.income || [],
    expenses: p.expenses || [],
    monthsCount: p.monthsCount || 0,
    isOnline: p.isOnline,
    lastUpdate: p.lastUpdate
  }));
  
  res.json(players);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Турнирный сервер запущен на порту ${PORT}`);
  console.log(`📱 Участники: http://localhost:${PORT}?tournament=true`);
  console.log(`👁️ Зрители: http://localhost:${PORT}/spectator`);
  console.log(`📊 API: http://localhost:${PORT}/api/tournament/stats`);
});


