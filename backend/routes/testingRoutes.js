// routes/testingRoutes.js
const express = require('express');
const router = express.Router();
const TestingController = require('../controllers/testingController');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles')

router.get('/tests', authenticateToken, authorizeRoles(['admin', 'teacher', 'student']), (req, res) => TestingController.getTestingList(req, res));
router.get('/tests/:id', authenticateToken, (req, res) => TestingController.getTestingData(req, res));
router.get('/tests/:testId/attempts/:attemptId/status', authenticateToken, (req, res) => TestingController.getTestingStatus(req, res));
router.get('/tests/:testId/attempts', authenticateToken, (req, res) => TestingController.getTestingAttempts(req, res));
router.get('/tests/:testId/results', authenticateToken, authorizeRoles(['student']), (req, res) => TestingController.getTestingResults(req, res));
router.get('/tests/:testId/userResults', authenticateToken, authorizeRoles(['teacher', 'admin']), (req, res) => TestingController.getTestingUserResults(req, res));

router.post('/tests/:testId/attempts/:attemptId/complete', authenticateToken, authorizeRoles(['student', 'teacher', 'admin']), (req, res) => TestingController.markTestingComplete(req, res));
router.post('/tests/:id/attempts', authenticateToken, authorizeRoles(['student', 'teacher', 'admin']), (req, res) => TestingController.getTestingAllResults(req, res));
router.post('/tests', authenticateToken, authorizeRoles(['admin', 'teacher']), (req, res) => TestingController.pushTestingList(req, res));
router.post('/tests/:id/verify-password', authenticateToken, (req, res) => TestingController.verifyTestingPassword(req, res));

router.put('/tests/:testId/attempts/:attemptId', authenticateToken, authorizeRoles(['student', 'teacher', 'admin']), (req, res) => TestingController.getTestingAttemptStatus(req, res));
router.put('/tests/:id', authenticateToken, authorizeRoles(['admin', 'teacher']), (req, res) => TestingController.getTestingObject(req, res));
router.put('/attempts/:id', authenticateToken, authorizeRoles(['student', 'teacher', 'admin']), (req, res) => TestingController.updateTestingAttempt(req, res));
router.put('/tests/:id/visibility', authenticateToken, authorizeRoles(['teacher', 'admin']), (req, res) => TestingController.updateTestVisibility(req, res));

router.delete('/tests/:id', authenticateToken, authorizeRoles(['admin', 'teacher']), (req, res) => TestingController.removeTestingObject(req, res));


module.exports = router;
