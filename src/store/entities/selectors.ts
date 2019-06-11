import set from 'lodash.set';
import get from 'lodash.get';

import decodeQueryCacheKey from '../../utils/decodeQueryCacheKey';

import { State } from '../reducer';
import { State as EntitiesState } from '../entities/reducer';
import { Entity } from '../../typings/API';
import { TYPE_DOMAIN_MAPPING } from './constants';

/**
 * Helper function to merge entities into their respective paths
 * Returns a new, non-mutated entity object
 */
export const mergeEntitiesIntoPaths = (entities: EntitiesState, paths: string[], entity: Entity) => {
  const clonedEntity = { ...entity };

  paths.forEach(path => {
    const sideloadReference = get(entity, path);

    const sideloadedEntity = entities[TYPE_DOMAIN_MAPPING[sideloadReference.type]][sideloadReference.id];

    set(clonedEntity, path, { ...sideloadReference, ...sideloadedEntity });
  });

  return clonedEntity;
};

export const selectMergedEntities = (state: State, { key }: { key: string }) => {
  const { ids } = state.queries[key];
  const { domain, options } = decodeQueryCacheKey(key);

  const include = options && options.include;

  // single entity, aka .info request
  if (typeof ids === 'string') {
    const entity = state.entities[domain][ids];

    if (include) {
      const entityPaths = include.split(',');

      return mergeEntitiesIntoPaths(state.entities, entityPaths, entity);
    }

    return entity;
  }

  const entities = ids.map(id => state.entities[domain][id]);

  if (include) {
    const entityPaths = include.split(',');

    const entitiesWithIncludedEntities = entities.map(entity => {
      return mergeEntitiesIntoPaths(state.entities, entityPaths, entity);
    });

    return entitiesWithIncludedEntities;
  }

  return entities;
};
