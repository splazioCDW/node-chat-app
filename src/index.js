// Ch 17 - Creating the Chat App Project
// challenge 1
// Goal: Create an Express web server //
// 1. Initialize npm and install Express 
// - npm init - yes/default
// - npm i express@4.16.4 (acutally did npm i express)
// 2. Setup a new Express server //	- Serve up the public directory
//	- Listen on port 3000
// 3. Create index.html and render "Chat App" to the screen
// 4. Test your work! Start the server and view the page in the browser
// node src/index.js

// Ch 17 - Creating the Chat App Project
// challenge 2
// Goal: Setup scripts in package.json //
// 1. Create a "start" script to start the app using node 
// - removed "test": "echo \"Error: no test specified\" && exit 1" from package.json
// - added     
//    "start": "mode src/index/js",
//    "dev": "nodemon src/index.js"
// 2. Install nodemon and a development dependency 
// - npm i nodemon@1.18.7 (actually did npm i nodemon)
// 3. Create a "dev" script to start the app using nodemon 
// 4. Run both scripts to test your work!

// Ch 17 - Socket.io Events Challenge 1
// Goal: Send a welcome message to new users //
// 1. Have server emit "message" when new client connects 
//	- Send "Welcome!" as the event data
// 2. Have client listen for "message" event and print the message to console 
// 3. Test your work!

// Ch 17 - Socket.io Events Challenge 2
// Goal: Allow clients to send message
//
// 1. Create a form with an input and button
//	- Similar to the weather form
// 2. Setup event listener for form submissions
//	- Emit "sendMessage" with input string as message data
// 3. Have server listen for "sendMessage"
//	- Send message to all connected clients
// 4. Test your work!

// Ch 17 - Sending Messages to Rooms
// Goal: Send messages to correct room //
// 1. Use getUser inside "sendMessage" event handler to get user data 
// 2. Emit the message to their current room 
// 3. Test your work!
// 4. Repeat for "sendLocation"

// Ch 17 - Sending Messages to Rooms
// Goal: Render username for text messages //
// 1. Setup the server to send username to client
// 2. Edit every call to "generateMessage" to include username
//	- Use "Admin" for sts messages like connnect/welcome/disconnect
// 3. Update client to render username in template
// 4. Test your workl|





//refactor to setup socket.io with express
 
//core Node modules (no need to install)
const path = require('path')
const http = require('http')

//requires npm install
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

//custome modules
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

//VARIABLES
//create express application 
const app = express()
//express library does this behind the scenes by add for socket.io
const server = http.createServer(app)
//support websocket with socket.io 
//expects to be setup with raw http server passed in
const io = socketio(server)

//port and public directory 
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

//configure the server
app.use(express.static(publicDirectoryPath))

//variable for practice app
// let count = 0
 
// //print message when a new client is connected
// io.on('connection', () => {
//     console.log(`New WebSocket connection`)
// })
//refactored for practice app
//print message when a new client is connected
io.on('connection', (socket) => {
    console.log(`New WebSocket connection`)
    
    //emits message to current client only
    // socket.emit('message', 'Welcome!')
    //rewrite with an object 
    // socket.emit('message', {
    //     text: 'Welcome',
    //     createdAt: new Date().getTime()
    // })
    //rewrite with utils/messages
    // socket.emit('message', generateMessage('Welcome!'))

    // //emits message to all other clients
    // // socket.broadcast.emit('message', 'A new user has joined!')
    // socket.broadcast.emit('message', generateMessage('A new user has joined!'))

    //emit user joining a room
    // socket.on('join', ({ username, room }) => {
    //     socket.join(room)

    //     socket.emit('message', generateMessage('Welcome!'))
    //     socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))
    // })
    //rewrite
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })  

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

        //used to update list of users in the room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })


    // //emit message to all clients
    // socket.on('sendMessage', (message) => {
    //     io.emit('message', message)
    // })
    //rewrite
    //emit message to all clients
    socket.on('sendMessage', (message, callback) => {
        //used to get the room of the user
        const user = getUser(socket.id)
        //checks for bad words
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }
        
        // io.emit('message', message)
        // io.emit('message', generateMessage(message))
        // emit to only the room the user is in
        io.to(user.room).emit('message', generateMessage(user.username, message))
        // callback('Delivered')
        callback()
    })

    //send location
    // socket.on('sendLocation', (coords) => {
    //     // io.emit('message', `Location: ${coords.latitude}, ${coords.longitude}`)
    //     //rewrite so google map is passed back
    //     io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
    // })
    //rewrite for challenge Ch 17 - Event Acknowledgements
    // socket.on('sendLocation', (coords, callback) => {
    //     io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
    //     callback()
    // })
    //rewrite for Ch 17 - Rendering Location Messages - challenge 1
    socket.on('sendLocation', (coords, callback) => {
        //used to get the room of the user
        const user = getUser(socket.id)
        // io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        //rewrite
        // io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        // emit to only the room that the user is in
        // io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        //rewrite to display name in chat when location is shared
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()

    })

    //emits message to all other clients, when a client has left
    // socket.on('disconnect', () => {      
    //     // io.emit('message', 'A user has left!')
    //     io.emit('message', generateMessage('A user has left!'))
    // })
    //rewrite
    socket.on('disconnect', () => {     
        const user = removeUser(socket.id)
        
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            //used to update list of users when a user has left
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

        }
        
    })

    //used for practice app
    // // countUpdated is custome named event
    // socket.emit('countUpdated', count)

    // socket.on('increment', () => {
    //     count++
    //     //socket.emit('countUpdated', count)
    //     //rewrite to update for all connections instead of only current connection
    //     io.emit('countUpdated', count)
    // })
})

//start server up with optional callback function
//refactor to setup socket.io
// app.listen(port, () => {
server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})