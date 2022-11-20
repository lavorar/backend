module.exports = ({ env }) => ({
    // ...
    slugify: {
        enabled: true,
        config: {
            contentTypes: {
                user: {
                    field: 'Slug',
                    references: 'name',                    
                },                
            },
            slugifyWithCount: true,
            shouldUpdateSlug: true,            
        },
    },
    // ...
});