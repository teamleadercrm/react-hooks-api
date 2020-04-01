import { createSelector, createSelectorCreator } from 'reselect';
import { State } from '../reducer';
import { selectIdsFromQuery, selectDomainNameFromQuery, selectDataFromQuery } from '../queries/selectors';
import { memoizeWithResultArrayEntryShallowCheck } from './memoizeWithResultArrayEntryShallowCheck';

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
  (domainName, entities) => entities[domainName],
);

export const selectEntitiesFromQueryFactory = () =>
  createSelectorWithResultArrayMemoization(
    selectDataFromQuery,
    selectIdsFromQuery,
    selectDomainFromQuery,
    (queryData, ids, domain) => {
      if (queryData) {
        return queryData;
      }

      if (!ids) {
        return null;
      }

      if (Array.isArray(ids)) {
        return ids.map((id) => domain[id]);
      }

      return domain[ids];
    },
  );
