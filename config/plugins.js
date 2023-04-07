module.exports = ({ env }) => ({
    // ...
    slugify: {
        enabled: false,
        config: {
            contentTypes: {
                users: {
                    field: 'Slug',
                    references: 'name',
                    slugifyWithCount: true,
                    shouldUpdateSlug: true,
                },
            },

        },
    },
    "custom-api": {
        enabled: true,
    },
});