// socket/index.js
const { Server } = require('socket.io');
const messageHistory = require('../utils/messageHistory');

class SocketHandler {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: '*',
                credentials: true
            },
        });

        this.rooms = {};
        this.messageHistory = messageHistory.read();

        this.io.on('connection', (socket) => {
            console.log('New connection:', socket.id);
            this.handleConnection(socket);
        });
    }

    handleConnection(socket) {
        socket.on('join-room', (roomId, userInfo) => {
            socket.join(roomId);
            console.log(`${userInfo.username} joined room ${roomId}`);

            if (!this.rooms[roomId]) {
                this.rooms[roomId] = [];
            }

            // Удаляем пользователя по socketId, если он уже есть
            this.rooms[roomId] = this.rooms[roomId].filter(user => user.userId !== userInfo.userId);

            // Добавляем пользователя в комнату
            this.rooms[roomId].push({
                socketId: socket.id,
                userId: userInfo.userId,
                username: userInfo.username,
                avatarUrl: userInfo.avatarUrl,
                micOn: userInfo.micOn,
            });

            // Отправляем историю чата
            if (this.messageHistory[roomId]) {
                socket.emit('chat-history', this.messageHistory[roomId]);
            } else {
                this.messageHistory[roomId] = [];
            }

            // Отправляем список всех пользователей в комнате
            this.io.to(roomId).emit('all-users', this.rooms[roomId]);

            // Обработка выхода из комнаты
            socket.on('leave-room', () => {
                this.rooms[roomId] = this.rooms[roomId].filter(user => user.socketId !== socket.id);
                this.io.to(roomId).emit('all-users', this.rooms[roomId]);
                socket.leave(roomId);
            });

            // Обработка отключения пользователя
            socket.on('disconnect', () => {
                if (this.rooms[roomId]) {
                    this.rooms[roomId] = this.rooms[roomId].filter(user => user.socketId !== socket.id);
                    this.io.to(roomId).emit('all-users', this.rooms[roomId]);
                }
            });

            // Обработка сигналов для WebRTC
            socket.on('signal', (data) => {
                this.io.to(data.to).emit('signal', {
                    from: socket.id,
                    signal: data.signal,
                });
            });

            // Обработка отправки сообщений
            socket.on('send-message', (message) => {
                if (!this.messageHistory[roomId]) {
                    this.messageHistory[roomId] = [];
                }

                this.messageHistory[roomId].push(message);
                messageHistory.write(this.messageHistory);
                this.io.to(roomId).emit('receive-message', message);
            });

            // Обработка обновления настроек пользователя
            socket.on('update-settings', (settings) => {
                const user = this.rooms[roomId].find(user => user.socketId === socket.id);
                if (user) {
                    user.micOn = settings.micOn;
                    this.io.to(roomId).emit('all-users', this.rooms[roomId]);
                }
            });
        });
    }
}

module.exports = SocketHandler;
