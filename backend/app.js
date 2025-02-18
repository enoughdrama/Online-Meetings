// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');

const { PORT } = require('./config');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const inviteRoutes = require('./routes/inviteRoutes');
const testingRoutes = require('./routes/testingRoutes');
const SocketHandler = require('./socket');

// Инициализация Express
const app = express();
const server = http.createServer(app);

// Инициализация Socket.io
const socketHandler = new SocketHandler(server);

// Настройка middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Настройка маршрутов
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', meetingRoutes);
app.use('/api', inviteRoutes);
app.use('/api', testingRoutes);

// Обработка маршрутов, не найденных выше
app.use((req, res) => {
    res.status(404).json({ message: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
