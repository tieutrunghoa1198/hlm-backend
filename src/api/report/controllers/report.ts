import { split } from "lodash";
import {
  totalOrderByProduct,
  totalOrderByYear,
  totalRevenue,
  totalOrderBySet,
  totalOrderByCategory,
  productsToPrepare,
} from "../services/report";

export default {
  totalOrderByYear: async (ctx, next) => {
    try {
      const { user } = ctx.state;
      const query = ctx.query;
      const year = query.year ? query.year.split(",") : null;
      if (user && user.id) {
        const store = await strapi.db
          .query("api::store.store")
          .findOne({ select: ["id"], where: { user: { id: user.id } } });
        if (store && store.id) {
          const data = await totalOrderByYear({
            storeId: store.id,
            yearSelected: year,
          });
          return data;
        }
      }
      return {};
    } catch (err) {
      ctx.body = err;
    }
  },
  totalRevenue: async (ctx, next) => {
    try {
      const { user } = ctx.state;
      const query = ctx.query;
      const year = query.year ? query.year.split(",") : null;
      if (user && user.id) {
        const store = await strapi.db
          .query("api::store.store")
          .findOne({ select: ["id"], where: { user: { id: user.id } } });
        if (store && store.id) {
          const data = await totalRevenue({
            storeId: store.id,
            yearSelected: year,
          });
          return data;
        }
      }
      return {};
    } catch (err) {
      ctx.body = err;
    }
  },
  totalOrderByProduct: async (ctx, next) => {
    try {
      const { user } = ctx.state;
      const query = ctx.query;
      const year = query.year ? query.year.split(",") : null;
      const month = query.month ? query.month.split(",") : null;
      if (user && user.id) {
        const store = await strapi.db
          .query("api::store.store")
          .findOne({ select: ["id"], where: { user: { id: user.id } } });
        if (store && store.id) {
          const data = await totalOrderByProduct({
            storeId: store.id,
            yearSelected: year,
            monthSelected: month,
          });
          return data;
        }
      }
      return {};
    } catch (err) {
      ctx.body = err;
    }
  },
  totalOrderBySet: async (ctx, next) => {
    try {
      const { user } = ctx.state;
      const query = ctx.query;
      const year = query.year ? query.year.split(",") : null;
      const month = query.month ? query.month.split(",") : null;
      if (user && user.id) {
        const store = await strapi.db
          .query("api::store.store")
          .findOne({ select: ["id"], where: { user: { id: user.id } } });
        if (store && store.id) {
          const data = await totalOrderBySet({
            storeId: store.id,
            yearSelected: year,
            monthSelected: month,
          });
          return data;
        }
      }
      return {};
    } catch (err) {
      ctx.body = err;
    }
  },
  totalOrderByCategory: async (ctx, next) => {
    try {
      const { user } = ctx.state;
      const query = ctx.query;
      const year = query.year ? query.year.split(",") : null;
      if (user && user.id) {
        const store = await strapi.db
          .query("api::store.store")
          .findOne({ select: ["id"], where: { user: { id: user.id } } });
        if (store && store.id) {
          const data = await totalOrderByCategory({
            storeId: store.id,
            yearSelected: year,
          });
          return data;
        }
      }
      return {};
    } catch (err) {
      ctx.body = err;
    }
  },
  productsToPrepare: async (ctx, next) => {
    try {
      const { user } = ctx.state;
      const query = ctx.query;
      if (user && user.id) {
        const store = await strapi.db
          .query("api::store.store")
          .findOne({ select: ["id"], where: { user: { id: user.id } } });
        if (store && store.id) {
          const data = await productsToPrepare({
            storeId: store.id,
          });
          return data;
        }
      }
      return {};
    } catch (err) {
      ctx.body = err;
    }
  },
};
