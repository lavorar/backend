module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/citys1/:slug',
            handler: 'city.findOne',
            config: {
                auth: false,
            },
        },
    ],
};