/**
 * These are deprecated selectors, they have been moved to this file for future reference
 * and because this "old" functionality (automatic merging & update queries isn't implemented yet)
 */

import produce from 'immer';
import set from 'lodash.set';
import camelCase from 'lodash.camelCase';
import { createSelector } from 'reselect';

import decodeQueryCacheKey from '../../utils/decodeQueryCacheKey';

import { State } from '../reducer';
import { State as EntitiesState } from '../entities/reducer';
import { Entity } from '../../typings/API';
import { TYPE_DOMAIN_MAPPING } from './constants';
import resolveReferences, { convertPathToKeys } from '../../utils/referenceResolver';
import { selectQueryByKey } from '../queries/selectors';
import { selectEntities } from './selectors';

/**
 * Helper function to merge entities into their respective paths
 * Returns a new, non-mutated entity object
 */
export const mergeEntitiesIntoPaths = (entities: EntitiesState, paths: string[], entity: Entity) => {
  return produce(entity, (draftEntity) => {
    paths.forEach((path) => {
      const keys = convertPathToKeys(path).map(camelCase);
      const sideloadReference = resolveReferences(entity, keys);

      let sideloadedEntity = null;

      if (Array.isArray(sideloadReference)) {
        sideloadReference.forEach((reference, index) => {
          if (reference === null) {
            return;
          }

          sideloadedEntity = entities[TYPE_DOMAIN_MAPPING[reference.type]]?.[reference.id];

          // @TODO, hard coding the keys here means we only allow the first key to be an array of possible references
          // find a way to support every nesting type
          const referencePath = `${keys[0]}.${index}.${keys[1]}`;

          set(draftEntity, referencePath, { ...reference, ...sideloadedEntity });
        });

        return;
      }

      if (sideloadReference === null) {
        return;
      }

      sideloadedEntity = entities[TYPE_DOMAIN_MAPPING[sideloadReference.type]]?.[sideloadReference.id];

      set(draftEntity, path.split('.').map(camelCase).join('.'), { ...sideloadReference, ...sideloadedEntity });
    });
  });
};

export const selectMergedEntitiesFactory = () =>
  createSelector(
    selectEntities,
    selectQueryByKey,
    (_, key) => key,
    (entities, query, key) => {
      if (!query || (!query.ids && !query.data)) {
        return null;
      }

      const { ids, data } = query;
      const { domain, options } = decodeQueryCacheKey(key);

      const include = options && options.include;

      // single entity, aka .info request
      if ((data && !Array.isArray(data)) || typeof ids === 'string') {
        const entity = data || entities[domain][ids as string];

        if (include) {
          const entityPaths = include.split(',');

          return mergeEntitiesIntoPaths(entities, entityPaths, entity);
        }

        return entity;
      }

      const entitiesForQuery = data || ids.map((id) => entities[domain][id]);

      if (include) {
        const entityPaths = include.split(',');

        const entitiesWithIncludedEntities = entitiesForQuery.map((entity) => {
          return mergeEntitiesIntoPaths(entities, entityPaths, entity);
        });

        return entitiesWithIncludedEntities;
      }

      return entitiesForQuery;
    },
  );

export const selectMergedEntitiesWithUpdateQueriesFactory = () =>
  createSelector(
    (state: State) => state,
    (_, key) => key,
    (_, __, updateQueries) => updateQueries,
    (state: State, key: string, updateQueries: Record<string, (data: { previousData: any; data: any }) => any>) => {
      const selectMergedEntities = selectMergedEntitiesFactory();

      const initialData = selectMergedEntities(state, key);

      return Object.entries(updateQueries).reduce((updatedData, [nextKey, nextUpdateQuery]) => {
        const nextQueryResult = selectMergedEntities(state, nextKey);

        // This query's results are still loading, don't run its updateQuery function on the data
        if (!nextQueryResult) {
          return updatedData;
        }

        return nextUpdateQuery({ previousData: updatedData, data: nextQueryResult });
      }, initialData);
    },
  );
