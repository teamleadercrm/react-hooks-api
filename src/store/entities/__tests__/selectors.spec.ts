import generateQueryCacheKey from '../../../utils/generateQueryCacheKey';

import { mergeEntitiesIntoPaths, selectMergedEntitiesFactory, selectMergedEntitiesWithUpdateQueriesFactory } from '../selectors';

describe('Entities selectors', () => {
  const keys = {
    singleProjectKey: generateQueryCacheKey({ domain: 'projects', action: 'info' }),
    singleProjectKeyWithInclude: generateQueryCacheKey({
      domain: 'projects',
      action: 'info',
      options: { include: 'customer' },
    }),
    multipleProjectsKey: generateQueryCacheKey({ domain: 'projects', action: 'list' }),
    multipleProjectsKeyWithInclude: generateQueryCacheKey({
      domain: 'projects',
      action: 'list',
      options: { include: 'customer' },
    }),
    multipleProjectsKeyWithNestedIncludedData: generateQueryCacheKey({
      domain: 'projects',
      action: 'list',
      options: { include: 'participants.participant' },
    }),
    aRunningQuery: generateQueryCacheKey({
      domain: 'contacts',
      action: 'list',
    }),
  };

  const INITIAL_STATE = {
    entities: {
      projects: {
        'e6538393-aa7e-4ec2-870b-f75b3d85f706': {
          id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
          customer: {
            type: 'contact',
            id: 'bdb37478-d05c-466c-acc0-4f8427d7bc92',
          },
        },
        '708c8008-3455-49a9-b66a-5222bcadb0cc': {
          id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
          customer: {
            type: 'contact',
            id: '712419dc-7ac9-46b8-b954-32753fb28867',
          },
        },
        'dbce36dc-328c-4e50-9685-471de7725b7b': {
          id: 'dbce36dc-328c-4e50-9685-471de7725b7b',
          participants: [
            {
              participant: {
                type: 'user',
                id: '2e46d7f5-6e9f-4d64-af13-c32cb6f72625',
              },
            },
          ],
        },
        '5c04d510-a613-4281-9b1a-949a3ed0d982': {
          id: '5c04d510-a613-4281-9b1a-949a3ed0d982',
          participants: [
            {
              participant: {
                type: 'user',
                id: '2e46d7f5-6e9f-4d64-af13-c32cb6f72625',
              },
            },
            {
              participant: {
                type: 'user',
                id: '0f49cca0-2a58-4feb-a49c-d72728073635',
              },
            },
          ],
        },
      },
      contacts: {
        'bdb37478-d05c-466c-acc0-4f8427d7bc92': {
          id: 'bdb37478-d05c-466c-acc0-4f8427d7bc92',
          name: 'John Appleseed',
        },
        '712419dc-7ac9-46b8-b954-32753fb28867': {
          id: '712419dc-7ac9-46b8-b954-32753fb28867',
          name: "John Appleseed's cousin",
        },
      },
      users: {
        '2e46d7f5-6e9f-4d64-af13-c32cb6f72625': {
          id: '2e46d7f5-6e9f-4d64-af13-c32cb6f72625',
          name: 'John Wick',
        },
        '0f49cca0-2a58-4feb-a49c-d72728073635': {
          id: '0f49cca0-2a58-4feb-a49c-d72728073635',
          name: "John Wick's cousin",
        },
      },
    },
    queries: {
      [keys.singleProjectKey]: {
        loading: false,
        ids: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
      },
      [keys.singleProjectKeyWithInclude]: {
        loading: false,
        ids: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
      },
      [keys.multipleProjectsKey]: {
        loading: false,
        ids: ['e6538393-aa7e-4ec2-870b-f75b3d85f706', '708c8008-3455-49a9-b66a-5222bcadb0cc'],
      },
      [keys.multipleProjectsKeyWithInclude]: {
        loading: false,
        ids: ['e6538393-aa7e-4ec2-870b-f75b3d85f706', '708c8008-3455-49a9-b66a-5222bcadb0cc'],
      },
      [keys.multipleProjectsKeyWithNestedIncludedData]: {
        loading: false,
        ids: ['dbce36dc-328c-4e50-9685-471de7725b7b', '5c04d510-a613-4281-9b1a-949a3ed0d982'],
      },
      [keys.aRunningQuery]: {
        loading: true,
      }
    },
  };

  describe('selectMergedEntitiesFactory', () => {
    const selectMergedEntities = selectMergedEntitiesFactory();

    it('selects the correct entity based on the query', () => {
      const selectedEntity = selectMergedEntities(INITIAL_STATE, keys.singleProjectKey);

      const resultEntity = {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        customer: {
          type: 'contact',
          id: 'bdb37478-d05c-466c-acc0-4f8427d7bc92',
        },
      };

      expect(selectedEntity).toEqual(resultEntity);
    });

    it('selects the correct entity and merges the sideloaded entities', () => {
      const selectedEntity = selectMergedEntities(INITIAL_STATE, keys.singleProjectKeyWithInclude);

      const resultEntity = {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        customer: {
          type: 'contact',
          id: 'bdb37478-d05c-466c-acc0-4f8427d7bc92',
          name: 'John Appleseed',
        },
      };

      expect(selectedEntity).toEqual(resultEntity);
    });

    it('selects the correct entities when a collection was requested', () => {
      const selectedEntities = selectMergedEntities(INITIAL_STATE, keys.multipleProjectsKey);

      const resultEntities = [
        {
          id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
          customer: {
            type: 'contact',
            id: 'bdb37478-d05c-466c-acc0-4f8427d7bc92',
          },
        },
        {
          id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
          customer: {
            type: 'contact',
            id: '712419dc-7ac9-46b8-b954-32753fb28867',
          },
        },
      ];

      expect(selectedEntities).toEqual(resultEntities);
    });

    it('selects the correct collection of entities and merges the sideloaded entities', () => {
      const selectedEntities = selectMergedEntities(INITIAL_STATE, keys.multipleProjectsKeyWithInclude);

      const resultEntities = [
        {
          id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
          customer: {
            type: 'contact',
            id: 'bdb37478-d05c-466c-acc0-4f8427d7bc92',
            name: 'John Appleseed',
          },
        },
        {
          id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
          customer: {
            type: 'contact',
            id: '712419dc-7ac9-46b8-b954-32753fb28867',
            name: "John Appleseed's cousin",
          },
        },
      ];

      expect(selectedEntities).toEqual(resultEntities);
    });

    it('can select and merge deeply nested sideloaded entities', () => {
      const selectedEntities = selectMergedEntities(INITIAL_STATE, keys.multipleProjectsKeyWithNestedIncludedData);

      const resultEntities = [
        {
          id: 'dbce36dc-328c-4e50-9685-471de7725b7b',
          participants: [
            {
              participant: {
                type: 'user',
                id: '2e46d7f5-6e9f-4d64-af13-c32cb6f72625',
                name: "John Wick",
              },
            },
          ],
        },
        {
          id: '5c04d510-a613-4281-9b1a-949a3ed0d982',
          participants: [
            {
              participant: {
                type: 'user',
                id: '2e46d7f5-6e9f-4d64-af13-c32cb6f72625',
                name: "John Wick",
              },
            },
            {
              participant: {
                type: 'user',
                id: '0f49cca0-2a58-4feb-a49c-d72728073635',
                name: "John Wick's cousin",
              },
            },
          ],
        },
      ];

      expect(selectedEntities).toEqual(resultEntities);
    });

    it('returns null when the query is still loading', () => {
      const selectedEntities = selectMergedEntities(INITIAL_STATE, keys.aRunningQuery);

      expect(selectedEntities).toBeNull();
    })
  });

  describe('mergeEntitiesIntoPaths', () => {
    it('correctly selects the right entities from an entities state object and merges it into an existing entity', () => {
      const entitiesState = {
        contacts: {
          '708c8008-3455-49a9-b66a-5222bcadb0cc': {
            id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
            name: 'John Appleseed',
          },
        },
      };

      const mainEntity = {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        participant: {
          anotherKey: {
            id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
            type: 'contact',
          },
        },
      };

      const paths = ['participant.anotherKey'];

      const result = {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        participant: {
          anotherKey: {
            id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
            type: 'contact',
            name: 'John Appleseed',
          },
        },
      };

      expect(mergeEntitiesIntoPaths(entitiesState, paths, mainEntity)).toEqual(result);
    });
  });

  describe('selectMergedEntitiesWithUpdateQueries', () => {
    const selectMergedEntitiesWithUpdateQueries = selectMergedEntitiesWithUpdateQueriesFactory();

    it('correctly merges the data using a map of keys and updateQueries', () => {
      const entities = {
        projects: {
          '4128e256-472d-438f-bd35-8f80bf9ed72f': {
            id: '4128e256-472d-438f-bd35-8f80bf9ed72f'
          },
          '45266e39-4edb-47f6-9f68-7c5e111eb4e2': {
            id: '45266e39-4edb-47f6-9f68-7c5e111eb4e2f'
          },
          'c211eadb-458d-4ef5-8d67-4358241e0757': {
            id: 'c211eadb-458d-4ef5-8d67-4358241e0757'
          }
        }
      };

      const updateQueryKeys = {
        initialKey: generateQueryCacheKey({ domain: 'projects', action: 'list', options: { page: 1 } }),
        firstUpdateKey: generateQueryCacheKey({ domain: 'projects', action: 'list', options: { page: 2 } }),
        secondUpdateKey: generateQueryCacheKey({ domain: 'projects', action: 'list', options: { page: 3 } }),

      }

      const queries = {
        [updateQueryKeys.initialKey]: {
          loading: false,
          ids: ['4128e256-472d-438f-bd35-8f80bf9ed72f']
        },
        [updateQueryKeys.firstUpdateKey]: {
          loading: false,
          ids: ['45266e39-4edb-47f6-9f68-7c5e111eb4e2']
        },
        [updateQueryKeys.secondUpdateKey]: {
          loading: false,
          ids: ['c211eadb-458d-4ef5-8d67-4358241e0757']
        },
      };

      const UPDATE_QUERIES_INITIAL_STATE = { entities, queries }

      const updateQueries = {
        [updateQueryKeys.firstUpdateKey]: ({ previousData, data }) => [...previousData, ...data],
        [updateQueryKeys.secondUpdateKey]: ({ previousData, data }) => [...previousData, ...data],
      };

      const result = [
        {
          id: '4128e256-472d-438f-bd35-8f80bf9ed72f'
        }, {
          id: '45266e39-4edb-47f6-9f68-7c5e111eb4e2f'
        }, {
          id: 'c211eadb-458d-4ef5-8d67-4358241e0757'
        }
      ]

      expect(
        selectMergedEntitiesWithUpdateQueries(UPDATE_QUERIES_INITIAL_STATE, updateQueryKeys.initialKey, updateQueries)
      ).toEqual(result);
    });
  })
});
