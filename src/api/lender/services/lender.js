'use strict';

/**
 * lender service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::lender.lender');
