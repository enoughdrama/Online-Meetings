// utils/database.js
const fs = require('fs');
const { DB_FILE } = require('../config');

class Database {
    constructor() {
        if (!fs.existsSync(DB_FILE)) {
            const initialData = { users: [], meetings: [], invites: [], tests: [], attempts: [] };
            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        }
    }

    read() {
        const data = fs.readFileSync(DB_FILE);
        return JSON.parse(data);
    }

    write(data) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    }
}

module.exports = new Database();
