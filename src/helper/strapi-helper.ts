const getUid = (type: string) => {
  return `api::${type}.${type}`;
};

const getService = (type: string) => {
  return strapi.service(getUid(type))!;
};

const getQueryBuilder = (type: string) => {
  return strapi.db.queryBuilder(getUid(type))!;
};

const getQuery = (type: string) => {
  return strapi.db.query(getUid(type))!;
};

const attachRelations = (
  type: string,
  id: any,
  data: any,
  trx: any
): Promise<any> => {
  return (strapi.db.entityManager as any).attachRelations(
    getUid(type),
    id,
    data,
    { transaction: trx }
  );
};

const updateRelations = (
  type: string,
  id: any,
  data: any,
  trx: any
): Promise<any> => {
  return (strapi.db.entityManager as any).updateRelations(
    getUid(type),
    id,
    data,
    { transaction: trx }
  );
};

const deleteRelations = (
  type: string,
  id: any,
  data: any,
  trx: any
): Promise<any> => {
  return (strapi.db.entityManager as any).deleteRelations(getUid(type), id, {
    transaction: trx,
  });
};

const sh = {
  getUid,
  getService,
  getQueryBuilder,
  getQuery,
  attachRelations,
  updateRelations,
  deleteRelations,
};

export {
  sh,
  getUid,
  getService,
  getQueryBuilder,
  getQuery,
  attachRelations,
  updateRelations,
  deleteRelations,
};
