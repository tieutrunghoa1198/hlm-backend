import {
  processKeyInData,
  validateStartdateEndDate,
} from "../../common/common-functions";
import { appendNumberToDuplicateNames } from "../../../common/common-functions";

const base62 = require("base62/lib/ascii");

export default {
  async beforeCreate(event) {
    const { data } = event.params;
    validateStartdateEndDate(data);
    if (data && data.title) {
      data.title = await appendNumberToDuplicateNames(
        data.title,
        data.store[0],
        "api::set.set",
        "title"
      );
    }
    await processKeyInData(data);
  },

  async afterCreate(event) {
    const { result } = event;
    // No key
    if (!result.key || result.key == null) {
      // Dùng Knex update để tránh format của hàm update
      const updated = await strapi.db
        .connection("sets")
        .where({ id: result.id })
        .update({ key: base62.encode(result.id) });
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;
    validateStartdateEndDate(data);
    await processKeyInData(data);
  },
};
