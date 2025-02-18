// routes/meetingRoutes.js
const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const authenticateToken = require('../middleware/authenticateToken');

/**
 * Маршрут для создания встречи.
 */
router.post('/meetings', authenticateToken, (req, res) => meetingController.createMeeting(req, res));

/**
 * Маршрут для получения встречи по ID.
 */
router.get('/meetings/:id', authenticateToken, (req, res) => meetingController.getMeetingById(req, res));

/**
 * Маршрут для получения всех встреч.
 */
router.get('/meetings', authenticateToken, (req, res) => meetingController.getAllMeetings(req, res));

/**
 * Маршрут для присоединения к встрече.
 */
router.post('/meetings/:id/join', authenticateToken, (req, res) => meetingController.joinMeeting(req, res));

/**
 * Маршрут для удаления участника из встречи.
 */
router.delete('/meetings/:meetingId/participants/:userId', authenticateToken, (req, res) => meetingController.removeParticipant(req, res));

module.exports = router;
