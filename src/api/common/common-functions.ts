export async function appendNumberToDuplicateNames(
  name: string,
  storeId: number,
  apiName: string,
  fieldToCheck: string
) {
  let count = 1;
  let nameWithNumber = name;
  while (true) {
    let whereQuery = { store: { id: storeId } };
    whereQuery[fieldToCheck] = nameWithNumber;
    const found = await strapi.db.query(apiName).findOne({
      select: [fieldToCheck],
      where: whereQuery,
    });
    if (found && found !== null) {
      count++;
      nameWithNumber = name + ` (${count})`;
    } else {
      return nameWithNumber;
    }
  }
}
export function findButCutOutArray(
  baseArray: any[],
  functionToCheck: Function
) {
  let remainArray = [];
  let matchItem = null;
  for (let i = 0; i < baseArray.length; i++) {
    const current = baseArray.pop();
    if (functionToCheck(current)) {
      matchItem = current;
      break;
    } else {
      remainArray.push(current);
    }
  }
  remainArray = remainArray.concat(baseArray);
  return [remainArray, matchItem];
}
export async function deleteFile(fileIdList: any[]) {
  const toDelete = fileIdList.map((currentId) => {
    return strapi.query("plugin::upload.file").delete({
      where: { id: currentId },
    });
  });
  return Promise.all(toDelete);
}
