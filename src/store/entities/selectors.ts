import produce from 'immer';
import set from 'lodash.set';

import decodeQueryCacheKey from '../../utils/decodeQueryCacheKey';

import { State } from '../reducer';
import { State as EntitiesState } from '../entities/reducer';
import { Entity } from '../../typings/API';
import { TYPE_DOMAIN_MAPPING } from './constants';
import resolveReferences, { convertPathToKeys } from '../../utils/referenceResolver';

/**
 * Helper function to merge entities into their respective paths
 * Returns a new, non-mutated entity object
 */
export const mergeEntitiesIntoPaths = (entities: EntitiesState, paths: string[], entity: Entity) => {
  return produce(entity, draftEntity => {
    paths.forEach(path => {
      const keys = convertPathToKeys(path);
      const sideloadReference = resolveReferences(entity, keys);

      if (sideloadReference === null) {
        return;
      }

      let sideloadedEntity = null;

      if (Array.isArray(sideloadReference)) {
        sideloadReference.forEach((reference, index) => {
          sideloadedEntity = entities[TYPE_DOMAIN_MAPPING[reference.type]][reference.id];

          // @TODO, hard coding the keys here means we only allow the first key to be an array of possible references
          // find a way to support every nesting type
          const referencePath = `${keys[0]}.${index}.${keys[1]}`;

          set(draftEntity, referencePath, { ...reference, ...sideloadedEntity })
        });

        return;
      }

      sideloadedEntity = entities[TYPE_DOMAIN_MAPPING[sideloadReference.type]][sideloadReference.id];

      set(draftEntity, path, { ...sideloadReference, ...sideloadedEntity });
    });
  })
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