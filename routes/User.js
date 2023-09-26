let users = []

const addUser = (user)=>{
    users.push(user);
    return user;
}

const removeUser = (id)=>{
    const index = users.findIndex(user=>user.socketID===id)
    if(index!=-1) {
        return users.splice(index,1)[0];
    }
}

const getRoomUsers = (room)=>{
    const userList = users.filter(user=>user.room===room)
    return userList;
}

const getCurrentUser = (id)=>{
    return users.find(user=>user.socketID===id)
}

module.exports = {
    addUser,
    removeUser,
    getCurrentUser,
    getRoomUsers
}