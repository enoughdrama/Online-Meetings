// models/Meeting.js
const { v4: uuidv4 } = require('uuid');

/**
 * Класс Meeting представляет встречу/совещание.
 */
class Meeting {
    constructor({ creatorId, name }) {
        this.id = uuidv4();
        this.creatorId = creatorId;
        this.name = name || `Встреча ${Date.now()}`;
        this.participants = [];
        this.invites = [];
    }
}

module.exports = Meeting;
