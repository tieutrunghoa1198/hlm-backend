/**
 * store service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::store.store",
  ({ strapi }) => ({
    async update(entityId, params) {
      if (params.data && params.data.businessType) {
        params.data.businessType = {
          set: params.data.businessType.map((bsType) => bsType.id),
        };
      }
      const result = await super.update(entityId, params);
      return result;
    },
    async findOne(entityId, params) {
      if (!params.populate) {
        params.populate = ["businessType"];
      }
      let currentStore = await super.findOne(entityId, params);
      return currentStore;
    },
    async updateRoleToSeller(userId: number) {
      await strapi.query("plugin::users-permissions.user").update({
        where: {
          id: { $eq: userId },
        },
        data: { role: 1 },
      });
    },
  })
);
