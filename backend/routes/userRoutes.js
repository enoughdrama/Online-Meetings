// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const { AVATAR_UPLOAD_PATH } = require('../config');
const { v4: uuidv4 } = require('uuid');

// Настройка multer для загрузки аватаров
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, AVATAR_UPLOAD_PATH);
    },
    filename: function (req, file, cb) {
        cb(null, `${uuidv4()}-${file.originalname}`);
    },
});

const attachmentStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/attachments/');
    },
    filename: function (req, file, cb) {
        cb(null, `${uuidv4()}-${file.originalname}`);
    },
});

const uploadAttachment = multer({ storage: attachmentStorage });
const uploadAvatar = multer({ storage: avatarStorage });


/**
 * Маршрут для обновления email.
 */
router.patch('/users/:id/email', authenticateToken, (req, res) => userController.updateEmail(req, res));

/**
 * Маршрут для обновления пароля.
 */
router.patch('/users/:id/password', authenticateToken, (req, res) => userController.updatePassword(req, res));

/**
 * Маршрут для обновления аватара.
 */
router.post('/users/:id/avatar', authenticateToken, uploadAvatar.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        
        // Масштабируем изображение до 300x300
        const resizedBuffer = await sharp(filePath)
            .resize(600, 400, { fit: 'cover' })
            .toBuffer();

        fs.writeFileSync(filePath, resizedBuffer);

        userController.updateAvatar(req, res);
    } catch (error) {
        console.error('Error processing avatar', error);
        res.status(500).json({ message: 'Ошибка при обработке аватара' });
    }
});

router.post('/upload', authenticateToken, uploadAttachment.single('file'), (req, res) => userController.uploadAttachment(req, res));

/**
 * Маршрут для получения профиля.
 */
router.get('/profile', authenticateToken, (req, res) => userController.getProfile(req, res));

/**
 * Маршрут для обновления пользователя.
 */
router.patch('/users/:id', authenticateToken, (req, res) => userController.updateUser(req, res));

/**
 * Маршрут для получения всех пользователей (админ).
 */
router.get('/users', authenticateToken, (req, res) => userController.getAllUsers(req, res));

/**
 * Маршрут для получения пользователя по ID.
 */
router.get('/users/:id', (req, res) => userController.getUserById(req, res));

/**
 * Маршрут для установки пользователю 2FA
*/
router.get('/users/:id/2fa/setup', authenticateToken, (req, res) => userController.setupUser2FA(req, res))

/**
 * Маршрут для подтверждения установки 2FA пользователю
*/
router.post('/users/:id/2fa/verify', authenticateToken, (req, res) => userController.verifyUser2FA(req, res))

router.post('/users/:id/2fa/disable', authenticateToken, (req, res) => userController.disableUser2FA(req, res))



module.exports = router;
