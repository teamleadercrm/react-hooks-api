import { combineReducers } from 'redux';

import queries from './queries/reducer';
import entities from './entities/reducer';

export default combineReducers({
  queries,
  entities,
});
