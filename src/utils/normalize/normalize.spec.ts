import normalize from './normalize';

describe('normalize', () => {
  it('correctly normalizes a single entity', () => {
    const entity = {
      id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
      property: 'a property',
    };

    const normalizedEntity = {
      '708c8008-3455-49a9-b66a-5222bcadb0cc': {
        id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
        property: 'a property',
      },
    };

    expect(normalize(entity)).toEqual(normalizedEntity);
  });

  it('correctly normalizes an array of entities', () => {
    const entities = [
      {
        id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
        property: 'a property',
      },
      {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        property: 'a property',
      },
    ];

    const normalizedEntities = {
      '708c8008-3455-49a9-b66a-5222bcadb0cc': {
        id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
        property: 'a property',
      },
      'e6538393-aa7e-4ec2-870b-f75b3d85f706': {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        property: 'a property',
      },
    };

    expect(normalize(entities)).toEqual(normalizedEntities);
  });

  it('returns an empty object when an empty array of entities is passed', () => {
    expect(normalize([])).toEqual({});
  });
});
