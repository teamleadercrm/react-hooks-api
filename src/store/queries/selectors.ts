import { createSelector } from 'reselect';
import { State } from '../reducer';
import decodeQueryCacheKey from '../../utils/decodeQueryCacheKey';
import { UpdateQueries } from '../../useQuery/useQuery';

export const selectQueries = (state: State) => state.queries;

export const selectQueryByKey = createSelector(
  selectQueries,
  (_, key) => key,
  (queries, key) => queries[key]
);

export const selectQueriesByKeys = createSelector(
  selectQueries,
  (_, keys) => keys,
  (queries, keys) => keys.map((key) => queries[key])
);

export const selectIdsFromQuery = createSelector(selectQueryByKey, (query) => query && query.ids);

export const selectDomainNameFromQuery = createSelector(
  (_, key) => key,
  (key) => decodeQueryCacheKey(key).domain
);

export const selectDataFromQuery = createSelector(selectQueryByKey, (query) => query && query.data);

export const selectFollowUpQueries = createSelector(
  (_: any, __: any, updateQueries: UpdateQueries) => updateQueries,
  selectQueries,
  (updateQueries, queries) => {
    return Object.keys(updateQueries).map((key) => {
      return { ...queries[key], updateQuery: updateQueries[key] };
    });
  }
);

// Factories

export const selectLoadingFromQueryFactory = () =>
  createSelector(selectQueryByKey, (query) => (query ? query.loading : true));

export const selectErrorFromQueryFactory = () => createSelector(selectQueryByKey, (query) => query && query.error);

export const selectMetaFromQueryFactory = () => createSelector(selectQueryByKey, (query) => query && query.meta);

export const selectLoadingFromQueriesFactory = () =>
  createSelector(selectQueriesByKeys, (queries) => queries.some((query) => query && query.loading));

export const selectErrorFromQueriesFactory = () =>
  createSelector(selectQueriesByKeys, (queries) => queries.map((query) => query && query.error).filter(Boolean));
