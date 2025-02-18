// services/meetingService.js
const db = require('../utils/database');
const Meeting = require('../models/Meeting');
const Invite = require('../models/Invite');

/**
 * Сервис управления встречами.
 */
class MeetingService {
    /**
     * Создание новой встречи.
     * @param {String} creatorId - ID создателя.
     * @param {String} name - Название встречи.
     * @returns {Object} - Новая встреча.
     */
    createMeeting(creatorId, name) {
        const dbData = db.read();
        const newMeeting = new Meeting({ creatorId, name });
        dbData.meetings.push(newMeeting);
        db.write(dbData);
        return newMeeting;
    }

    /**
     * Получение встречи по ID.
     * @param {String} meetingId - ID встречи.
     * @returns {Object} - Данные встречи.
     */
    getMeetingById(meetingId) {
        const dbData = db.read();
        const meeting = dbData.meetings.find(m => m.id === meetingId);
        if (meeting) {
            return meeting;
        } else {
            throw new Error('Встреча не найдена');
        }
    }

    /**
     * Получение всех встреч.
     * @returns {Array} - Список встреч.
     */
    getAllMeetings() {
        const dbData = db.read();
        return dbData.meetings;
    }

    /**
     * Добавление участника к встрече.
     * @param {String} meetingId - ID встречи.
     * @param {String} userId - ID пользователя.
     * @returns {Object} - Обновленная встреча.
     */
    addParticipant(meetingId, userId) {
        const dbData = db.read();
        const meeting = dbData.meetings.find(m => m.id === meetingId);
        if (meeting) {
            if (!meeting.participants.includes(userId)) {
                meeting.participants.push(userId);
                db.write(dbData);
                return meeting;
            } else {
                throw new Error('User already in the meeting');
            }
        } else {
            throw new Error('Встреча не найдена');
        }
    }

    /**
     * Удаление участника из встречи.
     * @param {String} meetingId - ID встречи.
     * @param {String} userId - ID пользователя.
     * @returns {Object} - Обновленная встреча.
     */
    removeParticipant(meetingId, userId) {
        const dbData = db.read();
        const meeting = dbData.meetings.find(m => m.id === meetingId);
        if (meeting) {
            meeting.participants = meeting.participants.filter(id => id !== userId);
            db.write(dbData);
            return meeting;
        } else {
            throw new Error('Встреча не найдена');
        }
    }

    /**
     * Создание приглашения на встречу.
     * @param {String} meetingId - ID встречи.
     * @param {Number} maxUses - Максимальное количество использований.
     * @returns {String} - Ссылка приглашения.
     */
    createInvite(meetingId, maxUses) {
        const dbData = db.read();
        const meeting = dbData.meetings.find(m => m.id === meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        const newInvite = new Invite({ meetingId, maxUses });
        dbData.invites.push(newInvite);
        db.write(dbData);
        return { inviteLink: newInvite.inviteLink };
    }

    /**
     * Принятие приглашения.
     * @param {String} inviteId - ID приглашения.
     * @param {String} userId - ID пользователя.
     * @returns {Object} - Обновленная встреча.
     */
    acceptInvite(inviteId, userId) {
        const dbData = db.read();
        const invite = dbData.invites.find(inv => inv.id === inviteId);
        if (!invite) {
            throw new Error('Invite not found');
        }

        if (invite.used >= invite.maxUses) {
            throw new Error('Invite has reached its maximum uses');
        }

        const meeting = dbData.meetings.find(m => m.id === invite.meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        if (!meeting.participants.includes(userId)) {
            meeting.participants.push(userId);
            invite.used += 1;
            db.write(dbData);
            return { message: 'User added to the meeting', meeting };
        } else {
            throw new Error('User already in the meeting');
        }
    }

    /**
     * Удаление приглашения.
     * @param {String} inviteId - ID приглашения.
     * @param {String} userId - ID пользователя, который удаляет приглашение.
     */
    deleteInvite(inviteId, userId) {
        const dbData = db.read();
        const inviteIndex = dbData.invites.findIndex(inv => inv.id === inviteId);
        if (inviteIndex === -1) {
            throw new Error('Invite not found');
        }

        const invite = dbData.invites[inviteIndex];
        const meeting = dbData.meetings.find(m => m.id === invite.meetingId);
        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Проверка прав пользователя
        if (
            meeting.creatorId !== userId &&
            !['admin', 'teacher'].includes(dbData.users.find(u => u.id === userId).role)
        ) {
            throw new Error('Доступ запрещен');
        }

        dbData.invites.splice(inviteIndex, 1);
        db.write(dbData);
        return { message: 'Invite deleted' };
    }
}

module.exports = new MeetingService();
