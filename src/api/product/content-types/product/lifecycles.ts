import { appendNumberToDuplicateNames } from "../../../common/common-functions";

export default {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data && data.name) {
      data.name = await appendNumberToDuplicateNames(
        data.name,
        data.store[0],
        "api::product.product",
        "name"
      );
    }
  },
};
