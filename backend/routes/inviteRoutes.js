// routes/inviteRoutes.js
const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/inviteController');
const authenticateToken = require('../middleware/authenticateToken');

/**
 * Маршрут для создания приглашения.
 */
router.post('/invites', authenticateToken, (req, res) => inviteController.createInvite(req, res));

/**
 * Маршрут для принятия приглашения.
 */
router.post('/invites/:id/accept', authenticateToken, (req, res) => inviteController.acceptInvite(req, res));

/**
 * Маршрут для получения всех приглашений.
 */
router.get('/invites', authenticateToken, (req, res) => inviteController.getAllInvites(req, res));

/**
 * Маршрут для удаления приглашения.
 */
router.delete('/invites/:id', authenticateToken, (req, res) => inviteController.deleteInvite(req, res));

module.exports = router;
