/**
 * order controller
 */

import { factories } from "@strapi/strapi";
const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async create(ctx) {
      const user = ctx.state.user;
      const result = await strapi
        .service("api::order.order")
        .createWithTransaction(user, ctx.request.body.data);
      return result;
    },
    async changeStatusDone(ctx) {
      try {
        const { id } = ctx.request.body;
        const options = {
          where: { id: id },
          data: {
            status: "done",
          },
        };
        const result = await strapi
          .service("api::order.order")
          .bulkUpdate(options);
        return result;
      } catch (err) {
        ctx.body = err;
      }
    },
    async changeStatusCancel(ctx) {
      try {
        const { id, cancelReason } = ctx.request.body;
        const options = {
          where: { id: id },
          data: {
            status: "cancel",
            cancel_reason: cancelReason,
          },
        };
        const result = await strapi
          .service("api::order.order")
          .bulkUpdate(options);
        return result;
      } catch (err) {
        ctx.body = err;
      }
    },
  })
);
