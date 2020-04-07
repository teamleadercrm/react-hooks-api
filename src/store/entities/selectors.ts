import { createSelector, createSelectorCreator } from 'reselect';
import { State } from '../reducer';
import { selectIdsFromQuery, selectDomainNameFromQuery, selectDataFromQuery } from '../queries/selectors';
import { memoizeWithResultArrayEntryShallowCheck } from './memoizeWithResultArrayEntryShallowCheck';
import { NormalizedEntities } from './entities';

/**
 * Creates a selector with array memoization support
 * This way we check for the equality of each entry in an array
 * instead of the array itself, which prevents re-renders
 * https://github.com/reduxjs/reselect/issues/74#issuecomment-271762561
 */
// @TODO remove once the typing for createSelectorCreator is fixed
// @ts-ignore
const createSelectorWithResultArrayMemoization = createSelectorCreator(memoizeWithResultArrayEntryShallowCheck);

export const selectEntities = (state: State) => state.entities;

export const selectDomainFromQuery = createSelector(
  selectDomainNameFromQuery,
  selectEntities,
  (domainName, entities) => entities[domainName]
);

const mapQueryDataToEntity = (query: { data: any; ids: string[] | string } | null, domain: NormalizedEntities) => {
  if (!query) {
    return null;
  }

  if (query.data) {
    return query.data;
  }

  if (!query.ids) {
    return null;
  }

  if (Array.isArray(query.ids)) {
    return query.ids.map((id) => domain[id]);
  }

  return domain[query.ids];
};

// Factories

export const selectEntitiesFromQueryFactory = () =>
  createSelectorWithResultArrayMemoization(
    selectDataFromQuery,
    selectIdsFromQuery,
    selectDomainFromQuery,
    (queryData, ids, domain) => mapQueryDataToEntity({ data: queryData, ids }, domain)
  );

export const selectEntityByDomainAndIdFactory = () =>
  createSelector(
    (_, domain) => domain,
    (_, __, id) => id,
    selectEntities,
    (domain, id, entities) => entities[domain]?.[id]
  );

export const selectEntitiesByDomainAndIdsFactory = () =>
  createSelectorWithResultArrayMemoization(
    (_, domain) => domain,
    (_, __, ids) => ids,
    selectEntities,
    (domain, ids, entities) => ids.map((id) => entities[domain]?.[id])
  );
