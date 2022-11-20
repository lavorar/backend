// src/extensions/users-permissions/strapi-server.js
// this route is only allowed for authenticated users
module.exports = (plugin) => {

    /*******************************  CUSTOM CONTROLERS  ********************************/
    plugin.controllers.user.updateLoggedInUser = async (ctx) => {
        await strapi.query('plugin::users-permissions.user').update({
            where: { id: ctx.state.user.id },
            data: ctx.request.body.data
        }).then((res) => {
            ctx.response.status = 200;
        })
    }

    /*******************************  CUSTOM ROUTES  ********************************/
    plugin.routes["content-api"].routes.push(
        {
            method: "POST",
            path: "/user/updateLoggedInUser",
            handler: "user.updateLoggedInUser",
            config: {
                prefix: "",
                policies: []
            }
        }
    )

    return plugin;
};