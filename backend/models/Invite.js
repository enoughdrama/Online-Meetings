// models/Invite.js
const { v4: uuidv4 } = require('uuid');

/**
 * Класс Invite представляет приглашение на встречу.
 */
class Invite {
    constructor({ meetingId, maxUses }) {
        this.id = uuidv4();
        this.meetingId = meetingId;
        this.inviteLink = `http://localhost:5001/invite/${this.id}`;
        this.maxUses = maxUses;
        this.used = 0;
    }
}

module.exports = Invite;
