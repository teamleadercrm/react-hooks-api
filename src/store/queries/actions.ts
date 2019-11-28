import { createStandardAction } from 'typesafe-actions';

import { QUERY_REQUEST, QUERY_FAILURE, QUERY_SUCCESS } from './constants';

export const queryRequest = createStandardAction(QUERY_REQUEST)<{ key: string }>();
export const queryFailure = createStandardAction(QUERY_FAILURE)<{ key: string; error: Error }>();
export const querySuccess = createStandardAction(QUERY_SUCCESS)<{ key: string; ids?: string | string[]; data?: any, meta?: any }>();
