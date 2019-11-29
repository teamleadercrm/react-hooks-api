import { createAction, ActionType } from 'typesafe-actions';

import { Response } from '../typings/API';
import { CACHE_QUERY_RESULT } from './constants';

// we only have one action right now
export type RootAction = ActionType<typeof cacheQueryResult>;

type Payload = {
  domain: string;
  action: string;
  options: object;
  data: Response;
};

export const cacheQueryResult = createAction(CACHE_QUERY_RESULT)<Payload>();
