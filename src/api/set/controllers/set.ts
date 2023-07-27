/**
 * set controller
 */

import { factories } from "@strapi/strapi";
import utils from "@strapi/utils";
import dayjs from "dayjs";

const { ApplicationError } = utils.errors;

export default factories.createCoreController("api::set.set", ({ strapi }) => ({
  async checkKeyDuplicate(ctx) {
    try {
      const key = ctx.params.key;
      console.log(key);
      const isDuplicate = await strapi
        .service("api::set.set")
        .checkKeyDuplicate(key);
      return isDuplicate;
    } catch (err) {
      ctx.body = err;
    }
  },

  async getSetBỵKey(ctx) {
    const key = ctx.params.key;

    const set = await strapi.db.query("api::set.set").findOne({
      where: {
        key: {
          $eq: key,
        },
      },
      populate: [
        "store",
        "productList",
        "productList.product",
        "productList.product.images",
        "productList.product.category",
      ],
    });

    if (!set) {
      throw new ApplicationError("Set này không tồn tại");
    }

    const currentDate = dayjs();

    if (set.startDate && currentDate.isBefore(set.startDate)) {
      throw new ApplicationError("Set chưa mở bán");
    }

    if (set.endDate && currentDate.isAfter(set.endDate)) {
      throw new ApplicationError("Set hết hạn");
    }

    let productList: any[] = set.productList;

    productList = productList.filter(
      (setProduct) =>
        setProduct.product && setProduct.product.status === "active"
    );

    return { ...set, productList };
  },
}));
