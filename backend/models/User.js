// server/models/User.js
const { v4: uuidv4 } = require('uuid');

/**
 * Класс User представляет пользователя системы.
 */
class User {
    constructor({ username, email, password, role = 'student', avatarUrl = '/static/avatars/default-avatar.png', group = '' }) {
        this.id = uuidv4();
        this.username = username;
        this.email = email;
        this.password = password; // Хешированный пароль
        this.role = role; // Роли: student, teacher, admin
        this.avatarUrl = avatarUrl;
        this.twoFA = { enabled: false, secret: null };
        this.token = null;
        this.group = group; // Новое поле - группа
    }
}

module.exports = User;
