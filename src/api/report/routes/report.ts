export default {
  routes: [
    {
      method: "GET",
      path: "/report/total-order-by-year",
      handler: "report.totalOrderByYear",
    },
    {
      method: "GET",
      path: "/report/total-revenue",
      handler: "report.totalRevenue",
    },
    {
      method: "GET",
      path: "/report/total-order-by-product",
      handler: "report.totalOrderByProduct",
    },
    {
      method: "GET",
      path: "/report/total-order-set",
      handler: "report.totalOrderBySet",
    },
    {
      method: "GET",
      path: "/report/total-order-category",
      handler: "report.totalOrderByCategory",
    },
    {
      method: "GET",
      path: "/report/products-to-prepare",
      handler: "report.productsToPrepare",
    },
  ],
};
