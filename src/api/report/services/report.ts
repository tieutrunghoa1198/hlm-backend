function makeWhere(conditionArray: any[], conditionText: string[]) {
  let queryString = "";
  let activeConditions = [];
  for (let i = 0; i < conditionArray.length; i++) {
    if (conditionArray[i]) {
      activeConditions.push(conditionText[i]);
    }
  }
  if (activeConditions.length > 0) {
    queryString = "WHERE " + activeConditions.join(" AND ");
  }
  return queryString;
}

export async function totalOrderByYear(data: {
  storeId: number;
  yearSelected: number[];
}) {
  if (data.storeId && !isNaN(data.storeId)) {
    const yearCondition = data.yearSelected
      ? `WHERE temp.period in (:yearRange)`
      : "";
    const query = `
    SELECT
      period,
      count(temp.id) AS orderTotal
    FROM (
      SELECT
        year(created_at) as "period",
        orders.id
      FROM orders
        JOIN orders_store_links ON orders.id = orders_store_links.order_id AND orders_store_links.store_id = :storeId
    ) AS temp
    ${yearCondition}
    GROUP BY temp.period
    ORDER BY temp.period ASC`;
    const rows = await strapi.db.connection.raw(query, {
      storeId: data.storeId,
      yearRange: data.yearSelected,
    });
    if (rows && rows.length > 0) {
      return rows[0];
    }
  }
  return null;
}
export async function totalRevenue(data: {
  storeId: number;
  yearSelected: number[];
}) {
  if (data.storeId && !isNaN(data.storeId)) {
    const yearCondition = data.yearSelected
      ? `WHERE temp.period in (:yearRange)`
      : "";
    const query = `
    SELECT
      period,
      sum(temp.total) AS totalRevenue
    FROM (
      SELECT
        year(orders.created_at) as "period",
        order_details.amount * order_details.unit_price as "total"
      FROM orders
        JOIN orders_store_links ON orders.id = orders_store_links.order_id AND orders_store_links.store_id = :storeId
        JOIN order_details_order_links ON orders.id = order_details_order_links.order_id
        JOIN order_details ON order_details_order_links.order_detail_id = order_details.id
      WHERE orders.status = :orderStatus
    ) AS temp
    ${yearCondition}
    GROUP BY temp.period
    ORDER BY temp.period ASC`;
    const rows = await strapi.db.connection.raw(query, {
      storeId: data.storeId,
      yearRange: data.yearSelected,
      orderStatus: "done",
    });
    if (rows && rows.length > 0) {
      return rows[0];
    }
  }
  return null;
}
export async function totalOrderByProduct(data: {
  storeId: number;
  yearSelected: number[];
  monthSelected: number[];
}) {
  if (data.storeId && !isNaN(data.storeId)) {
    let timeCondition = makeWhere(
      [data.yearSelected, data.monthSelected],
      [
        "year(orders.created_at) in (:yearSelected)",
        "month(orders.created_at) in (:monthSelected)",
      ]
    );
    const query = `
    SELECT
      DATE_FORMAT(joined.created_at,'%Y-%m') as "period",
      joined.\`name\` as productName,
      sum(joined.amount) as totalOrder
    FROM (
      SELECT
        products.id,
        products.\`name\`,
        joinBase.created_at,
        order_details.amount
      FROM (
        SELECT
          orders.id,
          orders.created_at
        FROM orders
          JOIN orders_store_links ON orders.id = orders_store_links.order_id AND orders_store_links.store_id = :storeId
        ${timeCondition}
      ) AS joinBase
        JOIN order_details_order_links ON joinBase.id = order_details_order_links.order_id
        JOIN order_details ON order_details_order_links.order_detail_id = order_details.id
        JOIN order_details_product_links ON order_details.id = order_details_product_links.order_detail_id
        JOIN products ON order_details_product_links.product_id = products.id
    ) as joined
    GROUP BY DATE_FORMAT(joined.created_at,'%Y-%m'), joined.id
    ORDER BY period asc, productName asc`;
    const rows = await strapi.db.connection.raw(query, {
      storeId: data.storeId,
      yearSelected: data.yearSelected,
      monthSelected: data.monthSelected,
    });
    if (rows && rows.length > 0) {
      return rows[0];
    }
  }
  return null;
}
export async function totalOrderBySet(data: {
  storeId: number;
  yearSelected: number[];
  monthSelected: number[];
}) {
  if (data.storeId && !isNaN(data.storeId)) {
    let timeCondition = makeWhere(
      [data.yearSelected, data.monthSelected],
      [
        "year(orders.created_at) in (:yearSelected)",
        "month(orders.created_at) in (:monthSelected)",
      ]
    );
    const query = `
    SELECT
      rawData.title as setName,
      sum(rawData.amount) as totalOrder
    FROM (
      SELECT
        sets.id,
        sets.title,
        order_details.amount
      FROM (
        SELECT
          orders.id,
          orders.created_at
        FROM orders
          JOIN orders_store_links ON orders.id = orders_store_links.order_id AND orders_store_links.store_id = :storeId
        ${timeCondition}
      ) AS joinBase
        JOIN orders_set_links ON joinBase.id = orders_set_links.order_id
            JOIN sets ON orders_set_links.set_id = sets.id
        JOIN order_details_order_links ON joinBase.id = order_details_order_links.order_id
        JOIN order_details ON order_details_order_links.order_detail_id = order_details.id
    ) as rawData
    GROUP BY rawData.id
    ORDER BY setName asc
    `;
    const rows = await strapi.db.connection.raw(query, {
      storeId: data.storeId,
      yearSelected: data.yearSelected,
      monthSelected: data.monthSelected,
    });
    if (rows && rows.length > 0) {
      return rows[0];
    }
  }
  return null;
}
export async function totalOrderByCategory(data: {
  storeId: number;
  yearSelected: number[];
}) {
  if (data.storeId && !isNaN(data.storeId)) {
    let timeCondition = makeWhere(
      [data.yearSelected],
      ["year(created_at) in (:yearSelected)"]
    );
    const query = `
    SELECT
      joined.\`name\` as categoryName,
      count(joined.id) as orderTotal
    FROM (
      SELECT distinct
        categories.id,
        categories.\`name\`,
        joinBase.id as orderId
      FROM (
        SELECT
          orders.id,
          orders.created_at
        FROM orders
          JOIN orders_store_links ON orders.id = orders_store_links.order_id AND orders_store_links.store_id = :storeId
        ${timeCondition}
      ) AS joinBase
        JOIN order_details_order_links ON joinBase.id = order_details_order_links.order_id
        JOIN order_details ON order_details_order_links.order_detail_id = order_details.id
        JOIN order_details_product_links ON order_details.id = order_details_product_links.order_detail_id
        JOIN products ON order_details_product_links.product_id = products.id
        JOIN products_category_links ON products.id = products_category_links.product_id
        JOIN categories ON categories.id = products_category_links.category_id
    ) as joined
    GROUP BY joined.id
    ORDER BY orderTotal DESC`;
    const rows = await strapi.db.connection.raw(query, {
      storeId: data.storeId,
      yearSelected: data.yearSelected,
    });
    if (rows && rows.length > 0) {
      return rows[0];
    }
  }
  return null;
}

export async function productsToPrepare(data: { storeId: number }) {
  if (data.storeId && !isNaN(data.storeId)) {
    const query = `
    SELECT
      joined.\`name\` as productName,
      sum(joined.amount) as itemsOrdered
    FROM (
      SELECT
        products.id,
        products.\`name\`,
        order_details.amount
      FROM (
        SELECT
          orders.id,
          orders.created_at
        FROM orders
          JOIN orders_store_links ON orders.id = orders_store_links.order_id AND orders_store_links.store_id = :storeId
        WHERE orders.status = :orderStatus
      ) AS joinBase
        JOIN order_details_order_links ON joinBase.id = order_details_order_links.order_id
        JOIN order_details ON order_details_order_links.order_detail_id = order_details.id
        JOIN order_details_product_links ON order_details.id = order_details_product_links.order_detail_id
        JOIN products ON order_details_product_links.product_id = products.id
    ) as joined
    GROUP BY joined.id
    ORDER BY productName DESC`;
    const rows = await strapi.db.connection.raw(query, {
      storeId: data.storeId,
      orderStatus: "confirmed",
    });
    if (rows && rows.length > 0) {
      return rows[0];
    }
  }
  return null;
}
