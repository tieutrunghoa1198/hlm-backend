"use strict";

async function up(knex) {}

module.exports = {
  async up(knex) {
    const currentTimestamp = new Date();
    await knex.schema.createTable("business_types", function (table) {
      table.increments();
      table.string("name");
      table.dateTime("published_at");
      table.timestamps(true, true);
    });
    await knex.batchInsert(
      "business_types",
      [
        { name: "Khác", published_at: currentTimestamp },
        { name: "Ăn uống", published_at: currentTimestamp },
        { name: "Nội thất", published_at: currentTimestamp },
        { name: "Gia dụng", published_at: currentTimestamp },
        { name: "Thời trang", published_at: currentTimestamp },
      ],
      1000
    );
  },
};
