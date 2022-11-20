'use strict';
// path: ./src/api/province/controllers/province.js

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::province.province', ({ strapi }) => ({
    // Method 1: Creating an entirely custom action
    async exampleAction(ctx) {
        try {
            ctx.body = 'ok';
        } catch (err) {
            ctx.body = err;
        }
    },

    // Method 3: Replacing a core action
    async findOne(ctx) {
        const { Slug } = ctx.params;
                
        const entity = await strapi.db.query('api::province.province').findOne({ where: {Slug} });
        
        const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

        return this.transformResponse(sanitizedEntity);
    },
}));
