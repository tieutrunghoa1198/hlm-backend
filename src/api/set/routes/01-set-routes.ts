export default {
  routes: [
    {
      // checkKeyDuplicate
      method: "GET",
      path: "/sets/key/:key",
      handler: "set.checkKeyDuplicate",
    },
    {
      method: "GET",
      path: "/sets/key/:key/get",
      handler: "set.getSetBỵKey",
    },
  ],
};
