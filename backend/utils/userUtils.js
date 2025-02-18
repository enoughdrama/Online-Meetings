const fs = require('fs');
const path = require('path');

const usersDbPath = path.join(__dirname, '..', 'users.json');

const readUsersFromFile = () => {
    try {
        const usersData = fs.readFileSync(usersDbPath, { encoding: 'utf8', flag: 'r' });
        return JSON.parse(usersData);
    } catch (error) {
        return [];
    }
};

const writeUsersToFile = (users) => {
    fs.writeFileSync(usersDbPath, JSON.stringify(users, null, 2), { encoding: 'utf8' });
};

const findUserByUsername = (username) => {
    const users = readUsersFromFile();
    return users.find(u => u.username === username);
};

const updateUser = (updatedUser) => {
    let users = readUsersFromFile();
    users = users.map(u => (u.username === updatedUser.username ? updatedUser : u));
    writeUsersToFile(users);
};

module.exports = {
    readUsersFromFile,
    writeUsersToFile,
    findUserByUsername,
    updateUser
};
