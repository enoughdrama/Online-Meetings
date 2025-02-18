const authorizeRoles = (roles) => (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(403).json({ message: 'Роль пользователя не определена' });
    }
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Доступ запрещен' });
    }
    next();
};

module.exports = authorizeRoles;