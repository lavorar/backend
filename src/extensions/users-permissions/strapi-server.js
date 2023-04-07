// src/extensions/users-permissions/strapi-server.js
// this route is only allowed for authenticated users
module.exports = (plugin) => {

    /*******************************  CUSTOM CONTROLERS  ********************************/
    plugin.controllers.user.updateLoggedInUser = async (ctx) => {
        console.log(ctx.request.body.data)
        const user = await strapi.query('plugin::users-permissions.user').update({
            where: { id: ctx.state.user.id },
            data: ctx.request.body.data,
            populate: {
                categories: true,
                provincia: true,
                localidad: true,
                notifications: true,
                role: true,
            },
        })

        ctx.body = { user }
    }

    /*******************************  CUSTOM ROUTES  ********************************/
    plugin.routes["content-api"].routes.push(
        {
            method: "POST",
            path: "/user/updateLoggedInUser/:id",
            handler: "user.updateLoggedInUser",
            config: {
                prefix: "",
                policies: []
            }
        }
    )

    return plugin;
};