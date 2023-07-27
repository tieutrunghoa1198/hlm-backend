/**
 * order service
 */

import { factories } from "@strapi/strapi";
import dayjs from "dayjs";
import { isEqual, isArray, get, set } from "lodash";
import { findButCutOutArray } from "../../common/common-functions";
const utils = require("@strapi/utils");
const { ApplicationError } = utils.errors;

export default factories.createCoreService(
  "api::order.order",
  ({ strapi }) => ({
    validate_orderDate(startDate: any, endDate: any) {
      const currentDate = dayjs();
      if (startDate) {
        if (currentDate.isBefore(dayjs(startDate))) {
          throw new ApplicationError("Set chưa được mở");
        }
      }
      if (endDate) {
        if (currentDate.isAfter(dayjs(endDate))) {
          throw new ApplicationError("Set đã hết hạn");
        }
      }
    },
    validate_removeProductsNotInSet(
      orderDetailList: any[],
      setProductList: any[]
    ) {
      const setProductIds: number[] = setProductList.map(
        (current) => current.product.id
      );
      const detailsOfProductInList = orderDetailList.filter(
        (current) =>
          current.product &&
          current.product.id &&
          setProductIds.includes(current.product.id)
      );
      return detailsOfProductInList;
    },
    validate_collapseOrderItems(orderDetailList: any[]) {
      let collapsedDetailList: any[] = orderDetailList.reduce(
        (collapsedList, currentOrderDetail) =>
          this.validate_collapseOrderItemsHelper(
            collapsedList,
            currentOrderDetail
          ),
        []
      );
      return collapsedDetailList;
    },
    validate_collapseOrderItemsHelper(
      collapsedDetailList: any[],
      newDetail: any
    ) {
      const foundPosition = collapsedDetailList.findIndex(
        (current) =>
          current.product.id == newDetail.product.id &&
          isEqual(current.attributes, newDetail.attributes)
      );
      if (foundPosition == -1) {
        collapsedDetailList.push(newDetail);
      } else {
        collapsedDetailList[foundPosition].amount =
          collapsedDetailList[foundPosition].amount + newDetail.amount;
      }
      return collapsedDetailList;
    },
    validate_calculateFinalPrice(
      orderDetailList: any[],
      setProductList: any[]
    ) {
      orderDetailList = orderDetailList.map((currentDetail) => {
        const currentSetProduct = setProductList.find(
          (current) => current.product.id == currentDetail.product.id
        );
        const basePrice = currentSetProduct.unitPrice;
        if (currentDetail.attributes && currentDetail.attributes.variations) {
          const variationPrice =
            this.validate_calculateFinalPriceHelperGetVariationPrice(
              currentDetail.attributes.variations,
              currentSetProduct.product.attributes.variations
            );
          currentDetail.unit_price = basePrice + variationPrice;
        } else {
          currentDetail.unit_price = basePrice;
        }
        return currentDetail;
      });
      return orderDetailList;
    },
    validate_calculateFinalPriceHelperGetVariationPrice(
      variationList: any[],
      originalVariations: any[]
    ) {
      let finalPrice = 0;
      for (let i = 0; i < variationList.length; i++) {
        const optionList = originalVariations[i].options;
        const currentOptionObj = optionList.find(
          (current) => current.label == variationList[i]
        );
        finalPrice += currentOptionObj.price;
      }
      return finalPrice;
    },

    createUpdatedStockTable(orderDetails: any[], setProductList: any[]) {
      let toUpdate = [];
      orderDetails.forEach((currentDetail) => {
        if (
          currentDetail.attributes &&
          currentDetail.attributes.variations &&
          currentDetail.attributes.variations.length > 0
        ) {
          let attObject = null;
          let [remainArray, matchItem] = findButCutOutArray(
            toUpdate,
            (current: any) => {
              return current.productId == currentDetail.product.id;
            }
          );
          toUpdate = remainArray;
          if (matchItem) {
            attObject = matchItem.attributes;
          } else {
            const currentSetProduct = setProductList.find(
              (current) => current.product.id == currentDetail.product.id
            );
            attObject = currentSetProduct.product.attributes;
          }
          let stockTable = attObject.stock;
          const stockBefore = get(
            stockTable,
            currentDetail.attributes.variations
          );
          const stockAfter = Number(stockBefore) - Number(currentDetail.amount);
          if (stockAfter < 0) {
            throw new ApplicationError(
              `Sản phẩm [${currentDetail.product.id}] hết hàng`
            );
          } else {
            stockTable = set(
              stockTable,
              currentDetail.attributes.variations,
              stockAfter
            );
            attObject.stock = stockTable;
          }
          toUpdate.push({
            productId: currentDetail.product.id,
            attributes: attObject,
          });
        } else {
          const currentSetProduct = setProductList.find(
            (current) => current.product.id == currentDetail.product.id
          );
          const attObject = currentSetProduct.product.attributes;
          const stockBefore = attObject.stock;
          const stockAfter = Number(stockBefore) - Number(currentDetail.amount);
          attObject.stock = stockAfter;
          toUpdate.push({
            productId: currentDetail.product.id,
            attributes: attObject,
          });
        }
      });
      return toUpdate;
    },

    validate(order: any, set: any, user: any) {
      if (!user || !user.id) {
        throw new ApplicationError("Bạn chưa đăng nhập");
      }
      if (!set) {
        throw new ApplicationError("Set này không tồn tại");
      }
      if (!order.order_details.length) {
        throw new ApplicationError("Bạn chưa chọn sản phẩm nào", {
          productList: "productList",
        });
      }
      this.validate_orderDate();
      order.order_details = this.validate_removeProductsNotInSet(
        order.order_details,
        set.productList
      );
      order.order_details = this.validate_collapseOrderItems(
        order.order_details
      );
      order.order_details = this.validate_calculateFinalPrice(
        order.order_details,
        set.productList
      );
      return order;
    },

    async createWithTransaction(user: any, order: any) {
      let set = await strapi.db.query("api::set.set").findOne({
        where: { key: order.key },
        populate: ["productList", "productList.product", "store"],
      });
      // Validate
      const productList = set.productList.filter(
        (setProduct) =>
          setProduct.product && setProduct.product.status === "active"
      );

      set = { ...set, productList };
      const cleanOrder = this.validate(order, set, user);
      // Create
      const { customer_name, customer_phone, customer_address, order_details } =
        cleanOrder;

      const stockUpdate_dynamic = this.createUpdatedStockTable(
        order_details,
        set.productList
      );

      const results = await strapi.db.transaction(
        async ({ trx, commit, rollback }) => {
          try {
            const orderIds = await strapi.db
              .queryBuilder("api::order.order")
              .transacting(trx)
              .insert({
                customer_name: customer_name,
                customer_phone: customer_phone,
                customer_address: customer_address,
                status: "confirmed",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              })
              .execute();

            const orderId = orderIds[0];

            const entityManager = strapi.db.entityManager as any;

            await entityManager
              .updateRelations(
                "api::order.order",
                orderId,
                { store: set.store.id, user: user.id, set: set.id },
                { transaction: trx }
              )
              .catch(async (error) => {
                return await rollback();
              });

            const orderDetails = (order_details as any[]).map((orderDetail) => {
              return {
                unit_price: orderDetail.unit_price,
                amount: orderDetail.amount,
                attributes: orderDetail.attributes,
                description: orderDetail.description ?? "",
              };
            });

            let orderDetailResults = await Promise.all(
              orderDetails.map((order_detail) =>
                trx("order_details")
                  .insert(order_detail)
                  .catch(async (error) => await rollback())
              )
            );

            let stockUpdateResult = await Promise.all(
              stockUpdate_dynamic.map((stockInfo) => {
                return trx("products")
                  .where({ id: stockInfo.productId })
                  .update({ attributes: JSON.stringify(stockInfo.attributes) })
                  .catch(async (error) => await rollback());
              })
            );

            let res = undefined;
            if (isArray(orderDetailResults)) {
              const a = await Promise.all(
                orderDetailResults.map((result, index) => {
                  return entityManager
                    .updateRelations(
                      "api::order-detail.order-detail",
                      result[0],
                      {
                        order: orderId,
                        product: order_details[index].product.id,
                      },
                      { transaction: trx }
                    )
                    .catch(async (err) => await rollback());
                })
              ).catch(async (err) => await rollback());

              res = await strapi.db.query("api::order.order").findOne({
                where: { id: orderId },
                populate: ["order_details"],
              });
            }
            return res;
          } catch (error) {
            rollback();
          }
        }
      );
      return results;
    },

    async bulkUpdate(options: any) {
      const result = await strapi.db
        .query("api::order.order")
        .updateMany(options);
      return result;
    },
  })
);
