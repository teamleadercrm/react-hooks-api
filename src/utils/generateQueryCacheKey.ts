// @TODO replace this with fast-stringify
const generateQueryCacheKey = (obj: object) => JSON.stringify(obj);

export default generateQueryCacheKey;
