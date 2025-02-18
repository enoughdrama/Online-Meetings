// utils/messageHistory.js
const fs = require('fs');
const { MESSAGE_HISTORY_FILE } = require('../config');

class MessageHistory {
    constructor() {
        if (!fs.existsSync(MESSAGE_HISTORY_FILE)) {
            fs.writeFileSync(MESSAGE_HISTORY_FILE, JSON.stringify({}));
        }
    }

    read() {
        const data = fs.readFileSync(MESSAGE_HISTORY_FILE);
        return JSON.parse(data);
    }

    write(data) {
        fs.writeFileSync(MESSAGE_HISTORY_FILE, JSON.stringify(data, null, 2));
    }
}

module.exports = new MessageHistory();
