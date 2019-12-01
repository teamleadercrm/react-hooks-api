import { State } from '../reducer';

export const selectQueryWithKey = (key: string) => (state: State) => {
  return state.queries[key];
};

export const selectLoadingFromQuery = (key: string) => (state: State) => {
  const query = selectQueryWithKey(key)(state);
  return query && query.loading || false;
}

export const selectMetaFromQuery = (key: string) => (state: State) => {
  const query = selectQueryWithKey(key)(state);
  return query && query.meta;
};

