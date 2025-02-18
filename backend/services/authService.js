// services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const db = require('../utils/database');
const User = require('../models/User');

/**
 * Сервис аутентификации пользователей.
 */
class AuthService {
    /**
     * Регистрация нового пользователя.
     * @param {Object} userData - Данные пользователя.
     * @returns {Object} - Зарегистрированный пользователь и токен.
     */
    async register(userData) {
        const dbData = db.read();
        const existingUser = dbData.users.find(user => user.email === userData.email);
        if (existingUser) {
            throw new Error('Email уже используется');
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = new User({
            ...userData,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );
        newUser.token = token;

        dbData.users.push(newUser);
        db.write(dbData);

        return { user: newUser, token };
    }

    /**
     * Вход пользователя.
     * @param {String} email - Email пользователя.
     * @param {String} password - Пароль пользователя.
     * @returns {Object} - Пользователь и токен или требование 2FA.
     */
    async login(email, password) {
        const dbData = db.read();
        const user = dbData.users.find(user => user.email === email);
        if (user && await bcrypt.compare(password, user.password)) {
            if (user.twoFA && user.twoFA.enabled) {
                return { require2FA: true, userId: user.id };
            } else {
                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '30d' }
                );
                user.token = token;
                db.write(dbData);
                return { user, token };
            }
        } else {
            throw new Error('Неверные учетные данные');
        }
    }

    /**
     * Верификация 2FA токена.
     * @param {String} userId - ID пользователя.
     * @param {String} token - Токен 2FA.
     * @returns {Object} - Пользователь и токен.
     */
    verify2FA(userId, token) {
        const dbData = db.read();
        const user = dbData.users.find(user => user.id === userId);
        if (user && user.twoFA && user.twoFA.enabled) {
            const speakeasy = require('speakeasy');
            const verified = speakeasy.totp.verify({
                secret: user.twoFA.secret,
                encoding: 'base32',
                token,
            });

            if (verified) {
                const authToken = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '30d' }
                );
                user.token = authToken;
                db.write(dbData);
                return { user, token: authToken };
            } else {
                throw new Error('Неверный токен 2FA');
            }
        } else {
            throw new Error('2FA не настроена');
        }
    }
}

module.exports = new AuthService();
