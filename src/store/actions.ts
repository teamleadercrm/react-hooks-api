import { createAction, ActionType } from 'typesafe-actions';

import { Response } from '../typings/API';
import { CACHE_QUERY_RESULT } from './constants';

export const cacheQueryResult = createAction(CACHE_QUERY_RESULT)<Payload>();

// we only have one action right now
export type RootAction = ActionType<typeof cacheQueryResult>;

type Payload = {
  domain: string;
  action: string;
  options: object;
  data: Response;
};
