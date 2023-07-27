/**
 * store controller
 */

import { factories } from "@strapi/strapi";

import utils from "@strapi/utils";

const { ApplicationError } = utils.errors;

export default factories.createCoreController(
  "api::store.store",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const currentUser = ctx.state.user;
        if (currentUser) {
          ctx.request.body.data.user = [currentUser.id];
          const response = await super.create(ctx);
          if (response) {
            await strapi
              .service("api::store.store")
              .updateRoleToSeller(currentUser.id);
            return response;
          }
        }
        return null;
      } catch (error) {
        throw new ApplicationError(error);
      }
    },
  })
);
