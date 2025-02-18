// controllers/meetingController.js
const meetingService = require('../services/meetingService');

/**
 * Контроллер управления встречами.
 */
class MeetingController {
    /**
     * Создание новой встречи.
     */
    createMeeting(req, res) {
        try {
            const { name } = req.body;
            const userRole = req.user.role;

            if (!['admin', 'teacher'].includes(userRole)) {
                return res.status(401).json({ message: 'Students can\'t create meetings.' });
            }

            const newMeeting = meetingService.createMeeting(req.user.id, name);
            res.status(201).json(newMeeting);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Получение встречи по ID.
     */
    getMeetingById(req, res) {
        try {
            const meetingId = req.params.id;
            const meeting = meetingService.getMeetingById(meetingId);

            // Проверка доступа
            if (
                req.user.role === 'student' &&
                !meeting.participants.includes(req.user.id)
            ) {
                return res.status(403).json({ message: 'Вы не приглашены на эту встречу' });
            }

            res.json(meeting);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    /**
     * Получение всех встреч.
     */
    getAllMeetings(req, res) {
        try {
            const meetings = meetingService.getAllMeetings();
            res.json(meetings);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Присоединение к встрече.
     */
    joinMeeting(req, res) {
        try {
            const meetingId = req.params.id;
            const userRole = req.user.role;
            const userId = req.user.id;

            const meeting = meetingService.getMeetingById(meetingId);

            if (userRole === 'student' && !meeting.participants.includes(userId)) {
                return res.status(403).json({ message: 'Вы не приглашены на эту встречу' });
            }

            const updatedMeeting = meetingService.addParticipant(meetingId, userId);
            res.json(updatedMeeting);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Удаление участника из встречи.
     */
    removeParticipant(req, res) {
        try {
            const { meetingId, userId } = req.params;

            const updatedMeeting = meetingService.removeParticipant(meetingId, userId);
            res.json({ message: 'Участник удален из встречи', meeting: updatedMeeting });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new MeetingController();
