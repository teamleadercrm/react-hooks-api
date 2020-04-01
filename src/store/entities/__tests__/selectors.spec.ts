import { selectEntities } from '../selectors';

describe('Entities selectors', () => {
  describe('selectEntities', () => {
    it('selects the entities state', () => {
      const state = {
        queries: {},
        entities: {
          projects: {},
        },
      };

      expect(selectEntities(state)).toEqual({ projects: {} });
    });
  });
});
