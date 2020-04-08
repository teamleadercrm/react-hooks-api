// @ts-nocheck
import {
  selectEntities,
  selectDomainFromQuery,
  selectEntitiesFromQueryFactory,
  selectEntityByDomainAndIdFactory,
  selectEntitiesByDomainAndIdsFactory,
  selectEntitiesFromQueryWithUpdateQueriesFactory,
  mapQueryToData,
} from '../selectors';
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

  describe('selectEntityByDomainAndIdFactory', () => {
    const selectEntityByDomainAndId = selectEntityByDomainAndIdFactory();

    it('selects an entity based on a domain and id', () => {
      const state = {
        entities: {
          projects: {
            '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c': {
              id: '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c',
              name: 'a project',
            },
          },
        },
      };

      expect(selectEntityByDomainAndId(state, 'projects', '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c')).toEqual({
        id: '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c',
        name: 'a project',
      });
    });
  });

  describe('selectEntitiesByDomainAndIdsFactory', () => {
    const selectEntitiesByDomainAndIds = selectEntitiesByDomainAndIdsFactory();

    it('selects an entity based on a domain and id', () => {
      const state = {
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

      expect(
        selectEntitiesByDomainAndIds(state, 'projects', [
          '5e22ba6c-c3e6-4503-8cf7-1ac82629f65c',
          '840958a7-b448-45be-9400-c90da58073ee',
        ])
      ).toEqual([
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

  describe('selectEntitiesFromQueryWithUpdateQueriesFactory', () => {
    const selectEntitiesFromQueryWithUpdateQueries = selectEntitiesFromQueryWithUpdateQueriesFactory();

    it('selects the combined data based with updateQueries', () => {
      const generateProjectDomainKey = (name) => generateQueryCacheKey({ domain: 'projects', options: name });
      const mainKey = generateProjectDomainKey('mainKey');
      const secondKey = generateProjectDomainKey('secondKey');
      const updateQueries = {
        [secondKey]: ({ previousData, data }: { previousData: any; data: any }) => [...previousData, ...data],
      };
      const state = {
        queries: {
          [mainKey]: {
            loading: false,
            ids: ['3e85d310-4ac5-444d-8465-de39767af6c7', '816105f4-37a8-4ff5-819b-d9597df18128'],
          },
          [secondKey]: {
            loading: false,
            ids: ['fb86bb39-96da-45d8-a394-fafc27fc2869', 'cf06becb-2988-4168-abc9-5c8faa542e69'],
          },
        },
        entities: {
          projects: {
            '3e85d310-4ac5-444d-8465-de39767af6c7': {
              id: '3e85d310-4ac5-444d-8465-de39767af6c7',
            },
            '816105f4-37a8-4ff5-819b-d9597df18128': {
              id: '816105f4-37a8-4ff5-819b-d9597df18128',
            },
            'fb86bb39-96da-45d8-a394-fafc27fc2869': {
              id: 'fb86bb39-96da-45d8-a394-fafc27fc2869',
            },
            'cf06becb-2988-4168-abc9-5c8faa542e69': {
              id: 'cf06becb-2988-4168-abc9-5c8faa542e69',
            },
          },
        },
      };

      const data = selectEntitiesFromQueryWithUpdateQueries(state, mainKey, updateQueries);

      expect(data).toEqual([
        {
          id: '3e85d310-4ac5-444d-8465-de39767af6c7',
        },
        {
          id: '816105f4-37a8-4ff5-819b-d9597df18128',
        },
        {
          id: 'fb86bb39-96da-45d8-a394-fafc27fc2869',
        },
        {
          id: 'cf06becb-2988-4168-abc9-5c8faa542e69',
        },
      ]);
    });
  });

  describe('mapQueryToData', () => {
    it('returns undefined when the query is undefined', () => {
      const data = mapQueryToData(undefined, {});
      expect(data).toBeUndefined();
    });

    it('returns the data from a query if there is any', () => {
      const data = mapQueryToData({ data: 'test' }, {});
      expect(data).toEqual('test');
    });

    it('returns undefined when there are no ids on the query yet', () => {
      const data = mapQueryToData({ loading: true }, {});
      expect(data).toBeUndefined();
    });

    it('returns single entities or arrays of entities when available', () => {
      const singleEntity = mapQueryToData(
        { ids: '803d0b7e-4ab0-496e-bec6-d7e1cf5c1ba1' },
        { '803d0b7e-4ab0-496e-bec6-d7e1cf5c1ba1': { id: '803d0b7e-4ab0-496e-bec6-d7e1cf5c1ba1' } }
      );

      expect(singleEntity).toEqual({ id: '803d0b7e-4ab0-496e-bec6-d7e1cf5c1ba1' });

      const entityCollection = mapQueryToData(
        { ids: ['803d0b7e-4ab0-496e-bec6-d7e1cf5c1ba1', '324d6d7a-3793-497a-be10-dcac78ee2468'] },
        {
          '803d0b7e-4ab0-496e-bec6-d7e1cf5c1ba1': { id: '803d0b7e-4ab0-496e-bec6-d7e1cf5c1ba1' },
          '324d6d7a-3793-497a-be10-dcac78ee2468': { id: '324d6d7a-3793-497a-be10-dcac78ee2468' },
        }
      );

      expect(entityCollection).toEqual([
        { id: '803d0b7e-4ab0-496e-bec6-d7e1cf5c1ba1' },
        { id: '324d6d7a-3793-497a-be10-dcac78ee2468' },
      ]);
    });
  });
});
