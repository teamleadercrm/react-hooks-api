import generateQueryCacheKey from '../../../utils/generateQueryCacheKey';

import { selectMergedEntities, mergeEntitiesIntoPaths } from '../selectors';

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
    },
  };

  describe('selectMergedEntities', () => {
    it('selects the correct entity based on the query', () => {
      const selectedEntity = selectMergedEntities(INITIAL_STATE, { key: keys.singleProjectKey });

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
      const selectedEntity = selectMergedEntities(INITIAL_STATE, { key: keys.singleProjectKeyWithInclude });

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
      const selectedEntities = selectMergedEntities(INITIAL_STATE, { key: keys.multipleProjectsKey });

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
      const selectedEntities = selectMergedEntities(INITIAL_STATE, { key: keys.multipleProjectsKeyWithInclude });

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
      const selectedEntities = selectMergedEntities(INITIAL_STATE, {
        key: keys.multipleProjectsKeyWithNestedIncludedData,
      });

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

    it('Does not crash when the referenced entity type is not in the entities state', () => {
      const entitiesState = {};

      const mainEntity = {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        assignee: {
          type: 'team',
          id: '708c8008-3455-49a9-b66a-5222bcadb0cc'
        },
      };

      const paths = ['assignee'];

      const result = {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        assignee: {
          type: 'team',
          id: '708c8008-3455-49a9-b66a-5222bcadb0cc'
        },
      };

      expect(mergeEntitiesIntoPaths(entitiesState, paths, mainEntity)).toEqual(result);
    })

    it('Does not crash when the entity reference is optional (null)', () => {
      const entitiesState = {};

      const mainEntity = {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        customFields: [
          {
            value: null,
            definition: {
              type: 'definition',
              id: '2b8861d8-7e25-49dd-9fec-f38f35f0d821'
            }
          }
        ],
      };

      const paths = ['customFields.value'];

      expect(mergeEntitiesIntoPaths(entitiesState, paths, mainEntity)).toEqual(mainEntity);
    })

    it('Does not crash when the entity reference is a primitive value', () => {
      const entitiesState = {};

      const mainEntity = {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        customFields: [
          {
            value: true,
            definition: {
              type: 'definition',
              id: '2b8861d8-7e25-49dd-9fec-f38f35f0d821'
            }
          },
          {
            value: 'lol',
            definition: {
              type: 'definition',
              id: '2b8861d8-7e25-49dd-9fec-f38f35f0d821'
            }
          },
          {
            value: 1,
            definition: {
              type: 'definition',
              id: '2b8861d8-7e25-49dd-9fec-f38f35f0d821'
            }
          }
        ],
      };

      const paths = ['customFields.value'];

      expect(mergeEntitiesIntoPaths(entitiesState, paths, mainEntity)).toEqual(mainEntity);
    })
  });
});
