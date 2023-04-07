'use strict';

/**
 * notification controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::notification.notification', ({ strapi }) => ({
    // Method 1: Creating an entirely custom action
    async exampleAction(ctx) {
        try {
            ctx.body = 'ok';
        } catch (err) {
            ctx.body = err;
        }
    },

    // Method 3: Replacing a core action
    async create(ctx) {
        // some logic here
        // console.log(ctx.state.user)
        // console.log(ctx.request.body)
        const response = await super.create(ctx);       // some more logic
        let datos = {
            id: response.data.id,
            score: response.data.id.attributes?.score,
            comment: response.data.id.attributes?.comment,
            read: false,
            acepted: false,
            user: ctx.request.body.data.user,
            user_request: ctx.request.body.data.user_request,
            type: ctx.request.body.data.type,
            review_updatedAt: new Date()
        }
        // strapi.$io.raw("notificationCreate", datos);


        return response;
    },

    async delete(ctx) {
        // some logic here
        // console.log(ctx.params)
        const notification = await strapi.db.query("api::notification.notification").findOne({
            populate: {
                user: true,
                user_request: true,
            },
            where: {
                id: ctx.params.id,
            }
        })
        const response = await super.delete(ctx);
        // some more logic
        // console.log(response)
        // console.log(notification)
        let datos = {
            id: notification.id,
            user: notification.user,
            user_request: notification.user_request,
            type: notification.type,
            review_updatedAt: new Date()
        }
        // strapi.$io.raw("notificationDelete", datos);

        return response;
    },

    async countUnRead(ctx) {

        var { query } = ctx.request
        console.log('query', query)
        const count = strapi.entityService.count('api::notification.notification', query);

        return count;
    }

}));
