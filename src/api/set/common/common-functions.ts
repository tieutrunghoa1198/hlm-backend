import dayjs from "dayjs";
const base62 = require("base62/lib/ascii");

export async function checkKeyDuplicate(key: string) {
  const found = await strapi.db.query("api::set.set").findOne({
    select: ["key"],
    where: { key: key },
  });
  return found && found !== null ? true : false;
}

export function formatKey(key: string) {
  if (key && key !== null) {
    key = key.trim();
    if (key.length > 0) {
      var slug = require("slug");
      key = "-" + slug(key);
      return key;
    }
  }
  return null;
}

export async function processKeyInData(data: any) {
  data.key = formatKey(data.key);
  // Key rỗng hoặc không hợp lệ, xóa đi để tự sinh
  if (!data.key || data.key == null) {
    delete data.key;
    return data;
  }
  // Có key nhưng bị trùng, thêm thời gian vào sau cho đến khi hết trùng thì thôi
  while (true) {
    if (await checkKeyDuplicate(data.key)) {
      data.key = `${data.key}-${base62.encode(Date.now())}`;
    } else {
      return data;
    }
  }
}

export function validateStartdateEndDate(data: any) {
  if (
    data.startDate &&
    data.startDate !== null &&
    data.endDate &&
    data.endDate !== null
  ) {
    if (!dayjs(data.endDate).isAfter(dayjs(data.startDate))) {
      delete data.startDate;
      delete data.endDate;
    }
  }
  return data;
}
