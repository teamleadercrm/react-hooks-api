import { selectQuery, selectMetaFromQuery } from '../selectors';

describe('queries selectors', () => {
  const INITIAL_STATE = {
    entities: {},
    queries: {
      uniqueKey: {
        loading: false,
        meta: {
          matches: 2,
        },
        data: {
          groupedBy: 'participant',
        },
      },
    },
  };

  it('selects the correct query', () => {
    const query = selectQuery(INITIAL_STATE, 'uniqueKey');

    expect(query).toEqual({
      loading: false,
      meta: { matches: 2 },
      data: {
        groupedBy: 'participant',
      },
    });
  });

  it('selects the meta of the query', () => {
    const meta = selectMetaFromQuery(INITIAL_STATE, 'uniqueKey');

    expect(meta).toEqual({ matches: 2 });
  });
});
