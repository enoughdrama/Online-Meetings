// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * Маршрут для регистрации.
 */
router.post('/register', (req, res) => authController.register(req, res));

/**
 * Маршрут для входа.
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * Маршрут для верификации 2FA.
 */
router.post('/login/2fa', (req, res) => authController.verify2FA(req, res));

module.exports = router;
