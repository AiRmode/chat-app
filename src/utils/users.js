const users = [];

//addUser ,removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    //clean data - to lowercase, trim, validate if provided
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    if (!room || !username) {
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user
    const exitingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    if (exitingUser) {
        return {
            error: 'Username is in use.'
        }
    }

    //store user
    const user = {id, username, room};
    users.push(user);

    return {user};
};

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id;
    });

    if (id !== -1) {
        return users[index];
    }
};

const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => {
        return user.room === room;
    });
    return usersInRoom;
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};

/*
addUser({
    id: 25,
    username: '   testUser   ',
    room: 'home'
});

addUser({
    id: 12,
    username: 'User2',
    room: 'home'
});
addUser({
    id: 42,
    username: '   testUser   ',
    room: 'home2'
});

const testGetUser = getUser(25);
console.log(testGetUser);

const testGetUsersInRoom = getUsersInRoom('home2');
console.log(testGetUsersInRoom);*/
