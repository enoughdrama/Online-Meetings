// services/TestingService.js
const db = require('../utils/database');

class TestingService {
    createMeeting(creatorId, name) {
        const dbData = db.read();
        const newMeeting = new Meeting({ creatorId, name });
        dbData.meetings.push(newMeeting);
        db.write(dbData);
        return newMeeting;
    }
}

module.exports = new TestingService();
