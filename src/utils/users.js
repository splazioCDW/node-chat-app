//to track the users

const users = []

//addUser
const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || ! room ) {
        return {
            error: 'Username and room are required.'
        }
    }
    
    //make sure users are unique by checking for an existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //validate username
    if(existingUser) {
        return {
            error: 'Username is in use.'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

//remove user
const removeUser = (id) => {
    //-1 for no match, 0 or greater if there is a match
    const index = users.findIndex((user) => user.id === id)

    //if match found, the user will be removed by index
    //removing only one
    //array will be returned
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

//getUser
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

//getUseresInRoom
const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser, 
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     id: 22,
//     username: 'Sarah',
//     room: 'West'
// })

// addUser({
//     id: 42,
//     username: 'Mike',
//     room: 'West'
// })

// addUser({
//     id: 32,
//     username: 'Sarah',
//     room: 'East'
// })

// const user = getUser(32)
// console.log(user)


// const userList = getUsersInRoom('west')
// console.log(userList)

//
// Goal: Create two new functions for users
//
// 1. Create getUser
//	- Accept id and return user object (or undefined)
// 2. Create getUsersInRoom
//	- Accept room name and return array of users (or empty array)
// 3. Test your work by calling the functions!



// console.log(users)

// //testing removing a user
// const removedUser = removeUser(22)

// console.log('removed user: ', removedUser)
// console.log(users)


//to get error when username and room are blank
// const res = addUser({
//     id: 33,
//     username: '',
//     room: ''
// })

//to get error user is in use
// const res = addUser({
//     id: 33,
//     username: 'Sarah',
//     room: 'West'
// })

// console.log(res)
