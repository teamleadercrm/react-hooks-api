import useQuery, { queries } from './useQuery';
import Provider from './Provider';
import decodeQueryCacheKey from './utils/decodeQueryCacheKey';
import generateQueryCacheKey from './utils/generateQueryCacheKey';
import { useSelector } from './store/CustomReduxContext';

export {
  queries,
  useQuery,
  Provider,
  decodeQueryCacheKey,
  generateQueryCacheKey,
  useSelector as useReactHooksAPISelector,
};

export default {
  queries,
  useQuery,
  Provider,
  decodeQueryCacheKey,
  generateQueryCacheKey,
  useReactHooksAPISelector: useSelector,
};
