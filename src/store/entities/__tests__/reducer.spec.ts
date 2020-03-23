import reducer, { State } from '../reducer';
import { saveNormalizedEntities } from '../actions';

const getInitialState = (initial?: Partial<State>) => reducer(initial as State, {} as any);

describe('Entities reducer', () => {
  it('sets an initial state', () => {
    const INITIAL_STATE = getInitialState();
    expect(INITIAL_STATE).toMatchSnapshot();
  });

  describe('saveNormalizedEntities', () => {
    it('saves a normalized entities object', () => {
      const INITIAL_STATE = getInitialState();

      const type = 'projects';
      const entities = {
        'e6538393-aa7e-4ec2-870b-f75b3d85f706': {
          id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        },
      };

      const RESULT_STATE = {
        projects: {
          'e6538393-aa7e-4ec2-870b-f75b3d85f706': {
            id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
          },
        },
      };

      expect(reducer(INITIAL_STATE, saveNormalizedEntities({ type, entities }))).toEqual(RESULT_STATE);
    });

    it('merges new entities next to existing entities', () => {
      const INITIAL_STATE = getInitialState({
        projects: { '708c8008-3455-49a9-b66a-5222bcadb0cc': { id: '708c8008-3455-49a9-b66a-5222bcadb0cc' } },
      });

      const type = 'projects';
      const entities = {
        'e6538393-aa7e-4ec2-870b-f75b3d85f706': {
          id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
        },
      };

      const RESULT_STATE = {
        projects: {
          '708c8008-3455-49a9-b66a-5222bcadb0cc': {
            id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
          },
          'e6538393-aa7e-4ec2-870b-f75b3d85f706': {
            id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
          },
        },
      };

      expect(reducer(INITIAL_STATE, saveNormalizedEntities({ type, entities }))).toEqual(RESULT_STATE);
    });
  });

  it('merges new properties of entities into existing entities', () => {
    const INITIAL_STATE = getInitialState({
      projects: {
        '708c8008-3455-49a9-b66a-5222bcadb0cc': { id: '708c8008-3455-49a9-b66a-5222bcadb0cc', oldProperty: 'test' },
      },
    });

    const type = 'projects';
    const entities = {
      '708c8008-3455-49a9-b66a-5222bcadb0cc': {
        id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
        newProperty: 'test',
      },
    };

    const RESULT_STATE = {
      projects: {
        '708c8008-3455-49a9-b66a-5222bcadb0cc': {
          id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
          oldProperty: 'test',
          newProperty: 'test',
        },
      },
    };

    expect(reducer(INITIAL_STATE, saveNormalizedEntities({ type, entities }))).toEqual(RESULT_STATE);
  });
});
