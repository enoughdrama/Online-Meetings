// controllers/userController.js
const userService = require('../services/userService');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { read, write } = require('../utils/database');

/**
 * Контроллер управления пользователями.
 */
class UserController {
    /**
     * Обновление email пользователя.
     */
    updateEmail(req, res) {
        try {
            const userId = req.params.id;
            const { email } = req.body;

            if (req.user.id !== userId) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }

            const result = userService.updateEmail(userId, email);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Обновление пароля пользователя.
     */
    async updatePassword(req, res) {
        try {
            const userId = req.params.id;
            const { current, new: newPassword } = req.body;

            if (req.user.id !== userId) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }

            const result = await userService.updatePassword(userId, current, newPassword);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Обновление аватара пользователя.
     */
    updateAvatar(req, res) {
        try {
            const userId = req.params.id;

            if (req.user.id !== userId) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const avatarUrl = `/static/avatars/${req.file.filename}`;
            const result = userService.updateAvatar(userId, avatarUrl);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    uploadAttachment(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'File not uploaded' });
            }

            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/attachments/${req.file.filename}`;
            res.status(200).json({ fileUrl });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Получение профиля пользователя.
     */
    getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = userService.getProfile(userId);
            res.json(user);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    /**
     * Обновление полей пользователя.
     */
    updateUser(req, res) {
        try {
            const userId = req.params.id;
            const { updateFields } = req.body;

            const result = userService.updateUser(userId, updateFields);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Получение всех пользователей (админ).
     */
    getAllUsers(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }

            const users = userService.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Получение пользователя по ID.
     */
    getUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = userService.getUserById(userId);
            res.json(user);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    setupUser2FA(req, res) {
        try {
            const { id } = req.params;

            console.log(req.user.id)
            console.log(id)

            if (req.user.id !== id) {
                return res.status(403).json({ message: 'Access Denied' });
            }

            const secret = speakeasy.generateSecret({ length: 20 });

            qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
                if (err) {
                    return res.status(500).json({ message: 'Error generating QR code' });
                }
                res.json({ secret: secret.base32, qrCode: data_url });
            });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    disableUser2FA(req, res) {
        try {
            const { id } = req.params;

            if (req.user.id !== id) {
                return res.status(403).json({ message: 'Access Denied' });
            }

            const db = read();
            const user = db.users.find(user => user.id === id);
            user.twoFA = { };

            write(db)

            res.status(200).json({ message: '2FA Disabled' })
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    verifyUser2FA(req, res) {
        try {
            const { id } = req.params;
            const { token, secret } = req.body;

            if (req.user.id !== id) {
                return res.status(403).json({ message: 'Access Denied' });
            }

            const verified = speakeasy.totp.verify({
                secret,
                encoding: 'base32',
                token,
            });

            if (verified) {
                const db = read();
                const user = db.users.find(user => user.id === id);
                user.twoFA = { enabled: true, secret };
                write(db);
                res.json({ message: '2FA enabled' });
            } else {
                res.status(400).json({ message: 'Invalid token' });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new UserController();
