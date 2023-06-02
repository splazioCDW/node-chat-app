//client side javaScript

// optional 
// server (emit) -> client (receive) —acknowledgement—> server 
// client (emit) -> server (receive) —acknowledgement—> client

// io()

const socket = io()

//elements to manipulate form
//start with $ for naming convention on DOM
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
//same as name from index.html
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

//autoscroll function
const autoscroll = () => {
    //console.log('enter autoscroll')
    //new message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    // const newMessageStyles = getComputedStyle($newMessage)
    // const newMessageHeight = $newMessage.offsetHeight
    // console.log(newMessageStyles)
    //grab the new message
    const newMessageStyles = getComputedStyle($newMessage)
    //get margin
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    //add margin to the height of the message
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // total height of messages container
    const containerHeight = $messages.scrollHeight

    // How for have U scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    // scoll to the bottom
    if (containerHeight - newMessageHeight <= scrollOffset) {
        //push to the bottom
        $messages.scrollTop = $messages.scrollHeight
    }
}

// ch 17 - Rendering Location Messages 
// challenge 1
// Goal: Create a separate event for location sharing messages //
// 1. Have server emit "locationMessage" with the URL
// 2. Have the client listen for "locationMessage" and print the URL to the console 
// 3. Test your work by sharing a location!!

//ch 17 - Rendering Location Messages 
// challenge 2
// Goal: Render new template for location messages //
// 1. Duplicate the message template //	- Change the id to something else
// 2. Add a link inside the paragraph with the link text "My current location" 
//	- URL for link should be the maps URL (dynamic)
// 3. Select the template from JavaScript
// 4. Render the template with the URL and append to messages list 
// 5. Test your work

// Ch 17 - Timestamps for Location Messages
// Goal: Add timestamps for location messages //
// 1. Create generateLocationMessage and export 
//	- { url: 11, createdAt: 0 }
// 2. Use genereatedLocationMessage when server emits locationMessage 
// 3. Update template to render time before the url 
// 4. Compile the template with the URL and the formatted time 
// 5. Test your workll

socket.on('message', (message) => {
    console.log(message)
    //render to browser
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        //message
        //rewrite with utils/messages
        message: message.text,
        //format with moment.js
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    //console.log('message ', $messages)
    $messages.insertAdjacentHTML('beforeend', html)
    console.log('message before autoscroll')
    autoscroll()
})

//listen for locationMessage and print to console
// socket.on('locationMessage', (url) => {
//     console.log('url: ', url)
//     const html = Mustache.render(locationMessageTemplate, {
//         url
//     })
//     $messages.insertAdjacentHTML('beforeend', html)

// })
//rewrite
socket.on('locationMessage', (message) => {
    console.log('url: ', message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

//testing updating list of users in the console
socket.on('roomData', ({ room, users }) => {
    // console.log('room ', room)
    // console.log('users: ', users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

// send a message
// document.querySelector('#message-form').addEventListener('submit', (e) => {
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    //disable button when a message is sent so there are not duplicate messages
    $messageFormButton.setAttribute('disabled', 'disabled')

    // const message = document.querySelector('input').value
    //alternative
    const message = e.target.elements.message.value
    
    // socket.emit('sendMessage', message)
    //rewrite and rewrite the eventListener in index.js
    // socket.emit('sendMessage', message, (note) => {
    //     console.log('The message was delivered.', note)
    // })
    //rewrite with bad-words filter
    socket.emit('sendMessage', message, (error) => {
        //re-enable button
        $messageFormButton.removeAttribute('disabled')

        //clear the input field and stay on field
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

//share location when client selects send-location button
// document.querySelector('#send-location').addEventListener('click', () => {
$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    //disable button
    $sendLocationButton.setAttribute('disabled', 'disabled')

    //rewrite for challenge Ch 17 - Event Acknowledgements
    //reqrite includes callback function
    // navigator.geolocation.getCurrentPosition((position) => {
    //     //console.log('position: ', position)

    //     //emit sendLocation object with data
    //     socket.emit('sendLocation', {
    //         latitude: position.coords.latitude,
    //         longitude: position.coords.longitude
    //     })
    // })
    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            //enable button
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

// socket.emit('join', {username, room })
socket.emit('join', {username, room }, (error) => {
    if (error) {
        alert(error)
        //send back to the root/join page
        location.href = '/'
    }
})

//used for practice app
// //custome named event
// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated!', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')
// })

//
//Ch 17 - Sharing Your Location
// Goal: Share coordinates with other user
//
// 1. Have client emit "sendLocation" with an object as the data //	- Object should contain latitude and longitude properties
// 2. Server should listen for "sendLocation"
//	- When fired, send a "message" to all connected clients "Location: long, lat"
// 3. Test your work!

//
// ch 17 - Event Acknowledgements
// Goal: Setup acknowledgment //
// 1. Setup the client acknowledgment function
// 2. Setup the server to send back the acknowledgment
// 3. Have the client print "Location shared!" when acknowledged
// 4. Test your work!

//
// Ch 17 - Form and Button States
// Goal: Disable the send location button while location being sent //
// 1. Set up a selector at the top of the file
// 2. Disable the button just before getting the current position // 3. Enable the button in the acknowledgment callback // 4. Test your workll



