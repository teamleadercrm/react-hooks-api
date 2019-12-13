import { createSelector } from 'reselect'

import { State } from '../reducer';

export const selectQueries = (state: State) => state.queries;

export const selectQueryByKey = createSelector(
  selectQueries,
  (_, key) => key,
  (queries, key) => queries[key]
);

export const selectLoadingFromQueryFactory = () => createSelector(
  selectQueryByKey,
  (query) => query && query.loading || false
);

export const selectMetaFromQueryFactory = () => createSelector(
  selectQueryByKey,
  (query) => query && query.meta
);

