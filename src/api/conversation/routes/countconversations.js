module.exports = {
    routes: [
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/conversations1/count',
            handler: 'conversation.count',
        },
    ]
}