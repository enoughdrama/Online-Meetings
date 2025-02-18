// server/services/userService.js
const bcrypt = require('bcrypt');
const db = require('../utils/database');
const User = require('../models/User');

class UserService {
    updateEmail(userId, newEmail) {
        const dbData = db.read();
        const user = dbData.users.find(user => user.id === userId);
        if (user) {
            user.email = newEmail;
            db.write(dbData);
            return { email: user.email };
        } else {
            throw new Error('Пользователь не найден');
        }
    }

    async updatePassword(userId, currentPassword, newPassword) {
        const dbData = db.read();
        const user = dbData.users.find(user => user.id === userId);
        if (user && await bcrypt.compare(currentPassword, user.password)) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            db.write(dbData);
            return { message: 'Пароль обновлен' };
        } else {
            throw new Error('Неверный текущий пароль');
        }
    }

    updateAvatar(userId, avatarUrl) {
        const dbData = db.read();
        const user = dbData.users.find(user => user.id === userId);
        if (user) {
            user.avatarUrl = avatarUrl;
            db.write(dbData);
            return { avatarUrl: user.avatarUrl };
        } else {
            throw new Error('Пользователь не найден');
        }
    }

    getProfile(userId) {
        const dbData = db.read();
        const user = dbData.users.find(user => user.id === userId);
        if (user) {
            return user;
        } else {
            throw new Error('Пользователь не найден');
        }
    }

    updateUser(userId, updateFields) {
        const dbData = db.read();
        const user = dbData.users.find(user => user.id === userId);
        if (user) {
            Object.assign(user, updateFields);
            db.write(dbData);
            return { message: 'User updated', user };
        } else {
            throw new Error('Пользователь не найден');
        }
    }

    getAllUsers() {
        const dbData = db.read();
        return dbData.users;
    }

    getUserById(userId) {
        const dbData = db.read();
        const user = dbData.users.find(user => user.id === userId);
        if (user) {
            return user;
        } else {
            throw new Error('User not found');
        }
    }
}

module.exports = new UserService();
