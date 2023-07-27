/**
 * set service
 */

import { factories } from "@strapi/strapi";
import { checkKeyDuplicate } from "../common/common-functions";

export default factories.createCoreService("api::set.set", ({ strapi }) => ({
  async checkKeyDuplicate(key) {
    try {
      return await checkKeyDuplicate(key);
    } catch (error) {
      throw new Error(error);
    }
  },
  async create(params) {
    try {
      if (
        params.data &&
        params.data.storeId &&
        params.data.productList &&
        params.data.productList.length > 0
      ) {
        const { productList, storeId, ...setInfo } = params.data;
        // Tạo menu
        const setCreated = await super.create({
          data: { ...setInfo, store: [storeId] },
        });
        // Tạo set-product
        if (setCreated.id) {
          const itemsInserted = await this.createSetProductFromProductList(
            productList,
            setCreated.id
          );
          return {
            ...setCreated,
            storeId: storeId,
            setProducts: itemsInserted,
          };
        } else {
          throw new Error("Create store failed");
        }
      } else {
        throw new Error(
          "Not enough information to create set, check storeId and productList"
        );
      }
    } catch (error) {
      throw new Error(error);
    }
  },
  async findOne(entityId, params) {
    if (!params.populate) {
      params.populate = {
        store: true,
        productList: {
          fields: ["unitPrice", "createdAt", "updatedAt"],
          populate: {
            product: {
              fields: [
                "id",
                "name",
                "unit",
                "description",
                "status",
                "attributes",
              ],
              populate: ["thumbnail", "images"],
            },
          },
        },
      };
    }
    const result = await super.findOne(entityId, params);
    if (result && result.productList) {
      result.productList = result.productList.map((current) => {
        const { product, ...otherDetails } = current;
        return { ...otherDetails, ...product };
      });
    }
    return result;
  },
  async update(entityId, params) {
    const { productList, store, ...setInfo } = params.data;
    // update set info
    const result = await super.update(entityId, { data: setInfo });
    // update product list
    await this.replaceProductListOfSet(productList, entityId);
    return result;
  },
  async createSetProductFromProductList(productList: any[], setId: number) {
    const itemsInserted = await Promise.all(
      productList.map((current) => {
        return strapi.db.query("api::set-product.set-product").create({
          data: {
            product: [current.id],
            unitPrice: current.price,
            set: [setId],
          },
        });
      })
    );
    return itemsInserted;
  },
  async replaceProductListOfSet(productList: any[], setId: number) {
    const found = await strapi.db
      .query("api::set-product.set-product")
      .findMany({
        select: ["id"],
        where: {
          set: {
            id: {
              $eq: setId,
            },
          },
        },
      });
    if (found && found.length > 0) {
      await strapi.db.query("api::set-product.set-product").deleteMany({
        where: {
          id: {
            $eq: found.map((setProduct) => setProduct.id),
          },
        },
      });
    }
    const inserted = await this.createSetProductFromProductList(
      productList,
      setId
    );
    return inserted;
  },
}));
