import { createAction } from 'typesafe-actions';

import { SAVE_NORMALIZED_ENTITIES } from './constants';
import { NormalizedEntities } from './entities';

export const saveNormalizedEntities = createAction(SAVE_NORMALIZED_ENTITIES)<{
  type: string;
  entities: NormalizedEntities;
}>();
