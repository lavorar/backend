module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/provinces1/:Slug',
            handler: 'province.findOne',
            config: {
                auth: false,
            },
        },
    ],
};