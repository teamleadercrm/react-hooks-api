import { DeepReadonly } from 'utility-types';
import { ActionType, getType } from 'typesafe-actions';
import produce, { Draft } from 'immer';

import * as actions from './actions';
import { NormalizedEntities } from './entities';

export type State = DeepReadonly<{
  [key: string]: NormalizedEntities;
}>;

export type EntitiesAction = ActionType<typeof actions>;

const INITIAL_STATE: State = {};

const entities = produce((draft: Draft<State>, action: EntitiesAction) => {
  switch (action.type) {
    case getType(actions.saveNormalizedEntities):
      draft[action.payload.type] = Object.keys(action.payload.entities).reduce(
        (entitiesById, nextEntityId) => ({
          ...entitiesById,
          [nextEntityId]: {
            ...entitiesById[nextEntityId],
            ...action.payload.entities[nextEntityId],
          },
        }),
        draft[action.payload.type] || {}
      );
      return;
  }
}, INITIAL_STATE);

export default entities;
