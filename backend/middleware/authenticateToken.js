// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

/**
 * Мидлвар для проверки JWT токена.
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Токен отсутствует' });

    jwt.verify(token, JWT_SECRET, (err, userData) => {
        if (err) return res.status(403).json({ message: 'Неверный токен' });
        req.user = userData;
        next();
    });
};

module.exports = authenticateToken;
