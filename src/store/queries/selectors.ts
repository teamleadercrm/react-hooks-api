import { createSelector } from 'reselect'
import { State } from '../reducer';
import decodeQueryCacheKey from '../../utils/decodeQueryCacheKey';

export const selectQueries = (state: State) => state.queries;

export const selectQueryByKey = createSelector(
  selectQueries,
  (_, key) => key,
  (queries, key) => queries[key]
);

export const selectIdsFromQuery = createSelector(selectQueryByKey, (query) => query && query.ids);

export const selectDomainNameFromQuery = createSelector(
  (_, key) => key,
  (key) => decodeQueryCacheKey(key).domain,
);

export const selectLoadingFromQueryFactory = () => createSelector(
  selectQueryByKey,
  (query) => query && query.loading || false
);

export const selectMetaFromQueryFactory = () => createSelector(
  selectQueryByKey,
  (query) => query && query.meta
);

export const selectLoadingFromQueryWithUpdateQueriesFactory = () => createSelector(
  (state: State) => state,
  (_, key) => key,
  (_, __, updateQueryKeys) => updateQueryKeys,
  (state, key: string, updateQueryKeys: string[]) => {
    const selectLoadingFromQuery = selectLoadingFromQueryFactory();
    return [key, ...updateQueryKeys].some(nextKey => selectLoadingFromQuery(state, nextKey));
  }
)
