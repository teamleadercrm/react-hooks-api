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
      const key = 'multipleProjectsQuery';

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
});
