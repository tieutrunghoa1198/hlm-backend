/**
 * product service
 */

import { factories } from "@strapi/strapi";
import { deleteFile } from "../../common/common-functions";
import { differenceWith } from "lodash";

export default factories.createCoreService(
  "api::product.product",
  ({ strapi }) => ({
    async delete(entityId, params) {
      const productToDelete = await strapi.db
        .query("api::product.product")
        .findOne({
          select: ["id"],
          populate: ["images"],
          where: { id: entityId },
        });
      if (productToDelete.images && productToDelete.images.length > 0) {
        const imagesToDelete = productToDelete.images.map(
          (currentImg) => currentImg.id
        );
        return await Promise.all([
          super.delete(entityId, params),
          deleteFile(imagesToDelete),
          strapi.db.query("api::set-product.set-product").delete({
            where: { product: { id: entityId } },
          }),
        ]);
      } else {
        return await Promise.all([
          super.delete(entityId, params),
          strapi.db.query("api::set-product.set-product").delete({
            where: { product: { id: entityId } },
          }),
        ]);
      }
    },
    async update(entityId, params) {
      const productToUpdate = await strapi.db
        .query("api::product.product")
        .findOne({
          select: ["id"],
          populate: ["images"],
          where: { id: entityId },
        });
      if (
        params.data &&
        params.data.images &&
        productToUpdate.images &&
        productToUpdate.images.length > 0
      ) {
        const noLongerUsedImages = differenceWith(
          productToUpdate.images,
          params.data.images,
          (a: any, b: any) => {
            return a.id == b.id;
          }
        );
        if (noLongerUsedImages && noLongerUsedImages.length > 0) {
          await deleteFile(noLongerUsedImages.map((current) => current.id));
        }
      }
      const result = await super.update(entityId, params);
      return result;
    },
  })
);
