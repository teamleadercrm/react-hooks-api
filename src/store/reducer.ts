import { DeepReadonly } from 'utility-types';
import { createReducer } from 'typesafe-actions';

import { CACHE_QUERY_RESULT } from './constants';
import generateQueryCacheKey from '../utils/generateQueryCacheKey';
import { Response } from '../typings/API';

import { RootAction } from './actions';

export type State = DeepReadonly<{
  queries: {
    [key: string]: Response;
  };
}>;

const INITIAL_STATE: State = {
  queries: {},
};

const queries = createReducer<State, RootAction>(INITIAL_STATE).handleAction(
  CACHE_QUERY_RESULT,
  (state, { payload }) => {
    const key = generateQueryCacheKey({ domain: payload.domain, action: payload.action, options: payload.options });
    return { ...state, queries: { ...state.queries, [key]: payload.data } };
  },
);

export default queries;
