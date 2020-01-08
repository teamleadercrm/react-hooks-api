import useQuery, { queries } from './useQuery';
import Provider from './Provider';
import decodeQueryCacheKey from './utils/decodeQueryCacheKey';
import generateQueryCacheKey from './utils/generateQueryCacheKey';

export { queries, useQuery, Provider, decodeQueryCacheKey, generateQueryCacheKey };

export default {
  queries,
  useQuery,
  Provider,
  decodeQueryCacheKey,
  generateQueryCacheKey
}
