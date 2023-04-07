module.exports = {
    routes: [
        { // Path defined with a URL parameter
            method: 'GET',
            path: '/notification1/countUnRead',
            handler: 'notification.countUnRead',
        },
    ]
}