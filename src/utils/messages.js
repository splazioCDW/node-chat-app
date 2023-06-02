const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

// const generateLocationMessage = (url) => {
//     return {
//         url,
//         createdAt: new Date().getTime()
//     }
// }
//rewrite so that the name is displayed in the chat when location is shared
const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    generateMessage,
    generateLocationMessage
}

