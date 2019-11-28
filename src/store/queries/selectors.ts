import { State } from '../reducer';

export const selectQuery = (state: State, key: string) => {
  return state.queries[key];
};

export const selectMetaFromQuery = (state: State, key: string) => {
  return selectQuery(state, key).meta;
};

