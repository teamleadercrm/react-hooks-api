import { selectEntities, selectDomainFromQuery, selectEntitiesFromQueryFactory } from '../selectors';
import generateQueryCacheKey from '../../../utils/generateQueryCacheKey';

describe('Entities selectors', () => {
  const INITIAL_STATE: any = {
    entities: {},
    queries: {},
  };

  describe('selectEntities', () => {
    it('selects the entities state', () => {
      const state = { ...INITIAL_STATE, entities: { projects: {} } };

      expect(selectEntities(state)).toEqual({ projects: {} });
    });
  });

  describe('selectDomainFromQuery', () => {
    it('selects the domain state based on a key', () => {
      const key = generateQueryCacheKey({ domain: 'projects' });
      const state = {
        ...INITIAL_STATE,
        entities: {
          projects: {
            '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c': {
              id: '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c',
              name: 'a project',
            },
          },
        },
      };

      expect(selectDomainFromQuery(state, key)).toEqual({
        '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c': {
          id: '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c',
          name: 'a project',
        },
      });
    });
  });

  describe('selectEntitiesFromQueryFactory', () => {
    const selectEntitiesFromQuery = selectEntitiesFromQueryFactory();
    const STATE = {
      entities: {
        projects: {
          '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c': {
            id: '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c',
            name: 'a project',
          },
          '840958a7-b448-45be-9400-c90da58073ee': {
            id: '840958a7-b448-45be-9400-c90da58073ee',
            name: 'a project',
          },
        },
      },
    };

    it('selects the data from the query if there is any', () => {
      const key = generateQueryCacheKey({ domain: 'projects' });
      const state = {
        ...STATE,
        queries: {
          [key]: {
            data: 'some unconventional entity data, e.g. reporting endpoints',
          },
        },
      };

      expect(selectEntitiesFromQuery(state, key)).toEqual('some unconventional entity data, e.g. reporting endpoints');
    });

    it('selects a single entity from the store based on a query', () => {
      const key = generateQueryCacheKey({ domain: 'projects' });
      const state = {
        ...STATE,
        queries: {
          [key]: {
            ids: '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c',
          },
        },
      };

      expect(selectEntitiesFromQuery(state, key)).toEqual({
        id: '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c',
        name: 'a project',
      });
    });

    it('selects a an array of entities based on a query', () => {
      const key = generateQueryCacheKey({ domain: 'projects' });
      const state = {
        ...STATE,
        queries: {
          [key]: {
            ids: ['5e22ba6c-c3e6-4503-8cf7-1ac82629f65c', '840958a7-b448-45be-9400-c90da58073ee'],
          },
        },
      };

      expect(selectEntitiesFromQuery(state, key)).toEqual([
        {
          id: '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c',
          name: 'a project',
        },
        {
          id: '840958a7-b448-45be-9400-c90da58073ee',
          name: 'a project',
        },
      ]);
    });
  });
});
