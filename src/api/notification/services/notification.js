'use strict';

/**
 * notification service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::notification.notification', ({ strapi }) => ({
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

        //buscar si exite una review

        const { user, type, user_request, comment, score } = ctx.data
        console.log(ctx)
        let response
        let datos
        if (type === 'Review') {
            const { results: notifications } = await super.findOne(
                {
                    user: user.id,
                    user_request: user_request.id,
                    type: type,

                })


            if (notifications.length > 0) {
                let payload = {
                    comment: comment,
                    score: score,
                    read: false,
                    review_updatedAt: new Date()
                }

                response = await super.update(notifications[0].id, {
                    data: payload
                });
                datos = {
                    id: response.data.id,
                    score: response.data.attributes?.score,
                    comment: response.data.attributes?.comment,
                    read: false,
                    acepted: false,
                    user: ctx.request.body.data.user,
                    user_request: ctx.request.body.data.user_request,
                    type: ctx.request.body.data.type,
                    review_updatedAt: response.data.attributes?.review_updatedAt
                }
            }
        } else {
            response = await super.create(ctx);
            // console.log(response)
            // console.log(ctx)
            // datos = {
            //     id: response.id,
            //     score: response.score,
            //     comment: response.comment,
            //     read: false,
            //     acepted: false,
            //     user: ctx.data.user,
            //     user_request: ctx.data.user_request,
            //     type: ctx.data.type,
            //     review_updatedAt: response.review_updatedAt
            // }
        }
        // some more logic

        return response;
    },

    // async delete(ctx) {
    //     // some logic here
    //     console.log(ctx.params)
    //     const { id } = ctx.params
    //     const notification = await strapi.db.query("api::notification.notification").findOne({
    //         populate: {
    //             user: true,
    //             user_request: true,
    //         },
    //         where: {
    //             id: id,
    //         }
    //     })
    //     const response = await super.delete(ctx);
    //     // some more logic
    //     // console.log(response)
    //     // console.log(notification)
    //     let datos = {
    //         id: notification.id,
    //         user: notification.user,
    //         user_request: notification.user_request,
    //         type: notification.type,
    //         review_updatedAt: new Date()
    //     }
    //     strapi.$io.raw("notificationDelete", datos);

    //     return response;
    // }

}));
