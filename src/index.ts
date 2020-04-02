import useQuery, { queries } from './useQuery';
import Provider from './Provider';
import decodeQueryCacheKey from './utils/decodeQueryCacheKey';
import generateQueryCacheKey from './utils/generateQueryCacheKey';
import { useSelector } from './store/CustomReduxContext';
import { selectEntityByDomainAndIdFactory, selectEntitiesByDomainAndIdsFactory } from './store/entities/selectors';

export {
  queries,
  useQuery,
  Provider,
  decodeQueryCacheKey,
  generateQueryCacheKey,
  useSelector as useReactHooksAPISelector,
  selectEntityByDomainAndIdFactory,
  selectEntitiesByDomainAndIdsFactory,
};

export default {
  queries,
  useQuery,
  Provider,
  decodeQueryCacheKey,
  generateQueryCacheKey,
  useReactHooksAPISelector: useSelector,
  selectEntityByDomainAndIdFactory,
  selectEntitiesByDomainAndIdsFactory,
};
