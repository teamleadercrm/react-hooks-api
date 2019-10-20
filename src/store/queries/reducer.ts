import { DeepReadonly } from 'utility-types';
import { ActionType, getType } from 'typesafe-actions';
import produce, { Draft } from 'immer';

import * as actions from './actions';

export type State = DeepReadonly<{
  [key: string]: {
    loading: boolean;
    error?: Error;
    ids?: string | string[];
    data?: any,
    meta?: any;
  };
}>;

export type QueryAction = ActionType<typeof actions>;

const INITIAL_STATE: State = {};

const queries = produce((draft: Draft<State>, action: QueryAction) => {
  switch (action.type) {
    case getType(actions.queryRequest):
      draft[action.payload.key] = { ...draft[action.payload.key], loading: true };
      return;
    case getType(actions.queryFailure):
      draft[action.payload.key] = { ...draft[action.payload.key], loading: false, error: action.payload.error };
      return;
    case getType(actions.querySuccess):
      draft[action.payload.key] = {
        ...draft[action.payload.key],
        loading: false,
        error: undefined,
        ids: action.payload.ids,
        data: action.payload.data,
        meta: action.payload.meta,
      };
      return;
  }
}, INITIAL_STATE);

export default queries;
