import set from 'lodash.set';
import get from 'lodash.get';

import decodeQueryCacheKey from '../../utils/decodeQueryCacheKey';

import { State } from '../reducer';
import { State as EntitiesState } from '../entities/reducer';
import { Entity } from '../../typings/API';

/**
 * @TODO
 * Helper function to determine how to convert an api entity reference; f.e.
 * { type: 'contact', id: 'test123' }
 * into the domain type "contacts", should this be revised in the api or should we
 * change our store to store directly by type, or create a mapping?
 */
export const convertAPIEntityTypeToDomain = (type: string) => {
  return `${type}s`;
};

/**
 * Helper function to merge entities into their respective paths
 * Returns a new, non-mutated entity object
 */
export const mergeEntitiesIntoPaths = (entities: EntitiesState, paths: string[], entity: Entity) => {
  const clonedEntity = { ...entity };

  paths.forEach(path => {
    const sideloadReference = get(entity, path);

    const sideloadedEntity = entities[convertAPIEntityTypeToDomain(sideloadReference.type)][sideloadReference.id];

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
