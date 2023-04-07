'use strict';

/**
 * conversation controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::conversation.conversation', ({ strapi }) => ({
    // Method 1: Creating an entirely custom action
    async count(ctx) {

        var { query } = ctx.request
        const count = strapi.entityService.count('api::conversation.conversation', {
            where: { query }
        });
        console.log('count', count)
        return count;
    }

}));
