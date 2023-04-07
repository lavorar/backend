'use strict';

/**
 * conversation service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::conversation.conversation');
