// controllers/inviteController.js
const meetingService = require('../services/meetingService');

/**
 * Контроллер управления приглашениями.
 */
class InviteController {
    /**
     * Создание приглашения.
     */
    createInvite(req, res) {
        try {
            const { meetingId, maxUses } = req.body;

            if (!meetingId || !maxUses) {
                return res.status(400).json({ message: 'meetingId and maxUses are required' });
            }

            const invite = meetingService.createInvite(meetingId, maxUses);
            res.status(201).json(invite);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Принятие приглашения.
     */
    acceptInvite(req, res) {
        try {
            const inviteId = req.params.id;
            const userId = req.user.id;

            const result = meetingService.acceptInvite(inviteId, userId);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Получение всех приглашений (админы и учителя).
     */
    getAllInvites(req, res) {
        try {
            const userRole = req.user.role;
            if (!['admin', 'teacher'].includes(userRole)) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }

            const db = require('../utils/database').read();
            res.json(db.invites);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Удаление приглашения.
     */
    deleteInvite(req, res) {
        try {
            const inviteId = req.params.id;
            const userId = req.user.id;

            const result = meetingService.deleteInvite(inviteId, userId);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new InviteController();
