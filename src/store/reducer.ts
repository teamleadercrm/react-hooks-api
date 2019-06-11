import { combineReducers } from 'redux';
import { DeepReadonly } from 'utility-types';

import queries, { State as QueriesState } from './queries/reducer';
import entities, { State as EntitiesState } from './entities/reducer';

export type State = DeepReadonly<{
  queries: QueriesState;
  entities: EntitiesState;
}>;

export default combineReducers({
  queries,
  entities,
});
