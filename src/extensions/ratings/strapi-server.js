module.exports = (plugin) => {
    plugin.controllers.reviews.find = async (ctx) => {
        const { slug } = ctx.params
        const { user } = ctx.state
        const { start, ignoreCount } = ctx.request.query
        const pageSize = await strapi.service('plugin::ratings.review').getPageSize()
        let reviews = await strapi.entityService.findMany("plugin::ratings.review",
            {
                filters: { related_to: { slug } },
                limit: pageSize,
                start,
                sort: { createdAt: "DESC" },
                populate: {
                    author: { fields: ["id", "username", "email", "name", "slug", "avatar"] }
                }
            }
        )
        let reviewsCount
        let averageScore = 0
        let userReview = null
        if (!ignoreCount) {
            reviewsCount = await strapi.db.query("plugin::ratings.review").count({
                where: {
                    related_to: { slug }
                }
            })
            const score = await strapi.db.query("plugin::ratings.r-content-id").findOne({
                select: ["average"],
                where: { slug }
            })
            if (score) {
                averageScore = score.average
            }
        }
        // Check whether the user has already posted a review
        if (user) {
            userReview = await strapi.db.query("plugin::ratings.review").findOne({
                select: ["id", "createdAt", "comment", "score"],
                where: {
                    related_to: { slug },
                    author: user.id
                },
                populate: {
                    author: { fields: ["id", "username", "email", "name", "slug"] }
                }
            })
            if (userReview) {
                // Exclude user review
                reviews = reviews.filter(r => r.id !== userReview.id)
            }
        }
        ctx.body = {
            reviewsCount,
            averageScore,
            userReview,
            reviews
        }
    };

    plugin.controllers.reviews.updateReview = async (ctx) => {
        const { slug } = ctx.params
        const { user } = ctx.state
        if (!user) {
            return ctx.badRequest("The user should be authenticated")
        }

        const userCanPostReview = await strapi.service("plugin::ratings.review")
            .userCanPostReview(user, slug)

        if (!userCanPostReview) {
            return ctx.forbidden("User cannot post a review on this content")
        }
        const { comment, score } = ctx.request.body
        if (!score) {
            return ctx.badRequest("Score should be between 1-5", { slug, comment, score })
        }

        const review = await strapi.db.query("plugin::ratings.review").findOne({
            select: ["id", "score"],
            where: {
                related_to: { slug },
                author: user.id
            }
        })
        if (!review) {
            return ctx.badRequest("User haven't posted a review yet. Review ID:", review)
        }
        // Get data of related content with the given slug
        // If not exists, this is the fist review
        // - create the contentID and grab the ID
        let relatedContent = await strapi.db.query("plugin::ratings.r-content-id").findOne({
            select: ["id", "average"],
            populate: {
                reviews: { fields: ["id"] }
            },
            where: { slug }
        })
        if (!relatedContent) {
            // First review ever for this content
            relatedContent = await strapi.entityService.create("plugin::ratings.r-content-id", {
                data: { slug, average: 0 },
                populate: {
                    reviews: { fields: ["id"] }
                },
            })
        }
        // console.log(review)
        const newReview = await strapi.entityService.update("plugin::ratings.review", review.id, {
            data: {
                comment,
                score,
            }
        })

        //Update average rating
        const oldTotalScore = relatedContent.average * relatedContent.reviews.length
        const newAvg = ((oldTotalScore - review.score) + score) / (relatedContent.reviews.length)
        await strapi.entityService.update("plugin::ratings.r-content-id", relatedContent.id, {
            data: {
                average: newAvg
            }
        })

        const userReview = await strapi.db.query("plugin::users-permissions.user").findOne({
            where: { slug }
        })

        await strapi.entityService.update("plugin::users-permissions.user", userReview.id, {
            data: {
                averageScore: newAvg,
                countsReview: relatedContent.reviews.length
            }
        })

        const verification = strapi.service('api::notification.notification').create({
            data: {
                user: userReview,
                user_request: user,
                type: 'Review',
                comment: newReview.comment,
                score: newReview.score,
                review_updatedAt: new Date()
            },
            populate: '*'
        });

        let datos = {
            user: userReview,
            user_request: user,
            type: 'Review',
            comment: newReview.comment,
            score: newReview.score,
            review_updatedAt: new Date()
        }
        // strapi.$io.raw("notificationCreate", datos);

        ctx.body = {
            newReview,
            newAvg
        }

    };

    plugin.controllers.reviews.create = async (ctx) => {
        const { user } = ctx.state
        if (!user) {
            return ctx.badRequest("The user should be authenticated")
        }
        const { slug } = ctx.params

        const userCanPostReview = await strapi.service("plugin::ratings.review")
            .userCanPostReview(user, slug)

        if (!userCanPostReview) {
            return ctx.forbidden("User cannot post a review on this content")
        }

        const { comment, score } = ctx.request.body
        if (!score) {
            return ctx.badRequest("Score should be between 1-5", { slug, comment, score })
        }
        // Only one review per user is allowed.
        // Check if the user has already posted a review.
        const review = await strapi.db.query("plugin::ratings.review").findOne({
            select: ["id"],
            where: {
                related_to: { slug },
                author: user.id
            }
        })
        if (review) {
            return ctx.badRequest("User already posted a review. Review ID:", review.id)
        }
        // Get data of related content with the given slug
        // If not exists, this is the fist review
        // - create the contentID and grab the ID
        let relatedContent = await strapi.db.query("plugin::ratings.r-content-id").findOne({
            select: ["id", "average"],
            populate: {
                reviews: { fields: ["id"] }
            },
            where: { slug }
        })
        if (!relatedContent) {
            // First review ever for this content
            relatedContent = await strapi.entityService.create("plugin::ratings.r-content-id", {
                data: { slug, average: 0 },
                populate: {
                    reviews: { fields: ["id"] }
                },
            })
        }
        // Create review and associate it with id.
        const newReview = await strapi.entityService.create("plugin::ratings.review", {
            data: {
                author: user.id,
                comment,
                score,
                related_to: relatedContent.id
            }
        })
        // Update average rating
        const oldTotalScore = relatedContent.average * relatedContent.reviews.length
        const newAvg = (oldTotalScore + score) / (relatedContent.reviews.length + 1)
        await strapi.entityService.update("plugin::ratings.r-content-id", relatedContent.id, {
            data: {
                average: newAvg
            }
        })
        const userReview = await strapi.db.query("plugin::users-permissions.user").findOne({
            where: { slug }
        })

        await strapi.entityService.update("plugin::users-permissions.user", userReview.id, {
            data: {
                averageScore: newAvg,
                countsReview: relatedContent.reviews.length + 1
            }
        })
        await strapi.entityService.create("api::notification.notification", {
            data: {
                user: userReview,
                user_request: user,
                type: 'Review',
                comment: newReview.comment,
                score: newReview.score,
                review_updatedAt: new Date()
            }
        })
        const notifi = await strapi.entityService.create("api::notification.notification", {
            data: {
                user: userReview,
                user_request: user,
                type: 'Review',
                comment: newReview.comment,
                score: newReview.score,
                review_updatedAt: new Date()
            },
            populate: '*'
        })

        let datos = {
            user: userReview,
            user_request: user,
            type: 'Review',
            comment: newReview.comment,
            score: newReview.score,
            review_updatedAt: new Date()
        }
        // strapi.$io.raw("notificationCreate", datos);
        ctx.body = { newReview: newReview }
    };

    plugin.controllers.reviews.findAll = async (ctx) => {
        console.log(ctx.query)
        const { query } = ctx
        // some logic here
        let reviews = await strapi.entityService.findMany("plugin::ratings.review", {
            filters: query,
            sort: { createdAt: "DESC" },
            populate: {
                author: { fields: ["id", "username", "email", "name", "slug"] },
                related_to: true,
            }
        })
        // console.log("reviews", reviews)
        // some more logic

        return reviews;

    };
    plugin.routes['content-api'].routes.push(
        {
            method: 'GET',
            path: 'ratings/reviews/:slug',
            handler: 'reviews.find',
            config: {
                prefix: "",
                policies: []
            }
        },
    );
    plugin.routes['content-api'].routes.push(
        {
            method: 'GET',
            path: '/ratings/reviews',
            handler: 'reviews.findAll',
            config: {
                prefix: "",
                policies: []
            }
        },
    );


    plugin.routes['content-api'].routes.push(
        {
            method: 'POST',
            path: '/ratings/reviews/updateReview/:slug',
            handler: 'reviews.updateReview',
            config: {
                prefix: "",
                policies: []
            }
        });

    plugin.routes['content-api'].routes.push(
        {
            method: 'POST',
            path: 'ratings/reviews/:slug',
            handler: 'reviews.create',
            config: {
                prefix: "",
                policies: []
            }
        });

    return plugin;
};