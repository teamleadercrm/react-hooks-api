import { createAction } from 'typesafe-actions';

import { QUERY_REQUEST, QUERY_FAILURE, QUERY_SUCCESS } from './constants';

/**
 * @TODO stronlgy type the APIContext
 */
export const queryRequest = createAction(QUERY_REQUEST)<{ key: string, APIContext: any }>();
export const queryFailure = createAction(QUERY_FAILURE)<{ key: string; error: Error }>();
export const querySuccess = createAction(QUERY_SUCCESS)<{ key: string; ids?: string | string[]; data?: any, meta?: any }>();
