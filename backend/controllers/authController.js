// controllers/authController.js
const authService = require('../services/authService');

/**
 * Контроллер аутентификации.
 */
class AuthController {
    /**
     * Регистрация пользователя.
     */
    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            const result = await authService.register({ username, email, password });
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Вход пользователя.
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Верификация 2FA.
     */
    async verify2FA(req, res) {
        try {
            const { userId, token } = req.body;
            const result = authService.verify2FA(userId, token);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new AuthController();
