'use strict';

/**
 * follower controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::follower.follower', ({ strapi }) => ({

    async create(ctx) {
        // some logic here
        // console.log(ctx.state.user)
        // console.log(ctx.request.body)
        const { data: { followerUser, followingUser } } = ctx.request.body
        const { data } = await super.create(ctx);
        console.log('datafollowcreate', data)
        await strapi.service('api::notification.notification').create({
            data: {
                type: 'FriendRequest',
                user_request: { id: followerUser },
                user: { id: followingUser },
                followerRequest: data.id,
                review_updatedAt: new Date()
            }
        });
        return data
        // strapi.$io.raw("notificationCreate", datos);
    },

    async delete(ctx) {
        // some logic here
        // console.log(ctx.state.user)
        // console.log(ctx.request.body)
        const followRequestId = ctx.params.id;
        console.log('datafollowdeleted', followRequestId)

        // Find the notification with the corresponding followerRequest value
        const notification = await strapi.db.query('api::notification.notification').findOne({ where: { type: 'FriendRequest', followerRequest: followRequestId } });
        console.log('found', notification)
        // If a notification is found, delete it
        if (notification) {
            await strapi.db.query('api::notification.notification').delete({ where: { id: notification.id } });
        }
        const { data } = await super.delete(ctx);
        console.log('datafollowdeleted', data)
        return data
    }

}));
