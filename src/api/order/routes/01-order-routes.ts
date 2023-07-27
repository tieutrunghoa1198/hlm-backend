export default {
  routes: [
    {
      method: "PUT",
      path: "/orders/change-status/done",
      handler: "order.changeStatusDone",
    },
    {
      method: "PUT",
      path: "/orders/change-status/cancel",
      handler: "order.changeStatusCancel",
    },
  ],
};
