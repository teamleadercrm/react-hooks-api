import { getType } from 'typesafe-actions';

import decodeQueryCacheKey from '../utils/decodeQueryCacheKey';

import * as queryActions from './queries/actions';
import * as entitiesActions from './entities/actions';
import normalize from '../utils/normalize';
import { TYPE_DOMAIN_MAPPING } from './entities/constants';
import { Response } from '../typings/API';

/**
 * @TODO strongly type the Action
 */
const fetcher = ({ dispatch }) => (next) => ({ type, payload }: { type: string; payload: any }) => {
  switch (type) {
    case getType(queryActions.queryRequest): {
      const key = payload.key;
      const { domain, action, options } = decodeQueryCacheKey(key);

      const isEntityAction = action === 'info' || action === 'list';

      // @TODO this promise should be cancellable
      payload.APIContext[domain][action](options)
        .then((response: Response) => {
          if (!isEntityAction) {
            Object.keys(response.included || {}).forEach((entityType) => {
              const normalizedEntities = normalize(response.included![entityType]);
              const domainFromType = TYPE_DOMAIN_MAPPING[entityType];
              dispatch(entitiesActions.saveNormalizedEntities({ type: domainFromType, entities: normalizedEntities }));
            });

            dispatch(
              queryActions.querySuccess({
                key,
                data: response.data,
                meta: response.meta,
              })
            );

            return;
          }

          const mainEntities = normalize(response.data);
          dispatch(entitiesActions.saveNormalizedEntities({ type: domain, entities: mainEntities }));

          Object.keys(response.included || {}).forEach((entityType) => {
            const normalizedEntities = normalize(response.included![entityType]);
            const domainFromType = TYPE_DOMAIN_MAPPING[entityType];
            dispatch(entitiesActions.saveNormalizedEntities({ type: domainFromType, entities: normalizedEntities }));
          });

          dispatch(
            queryActions.querySuccess({
              key,
              ids: Array.isArray(response.data) ? response.data.map((entity) => entity.id) : response.data.id,
              meta: response.meta,
            })
          );
        })
        .catch((error) => {
          dispatch(queryActions.queryFailure({ key, error }));
        });
    }
  }

  return next({ type, payload });
};

export default fetcher;
