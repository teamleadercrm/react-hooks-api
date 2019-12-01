import { selectQueryWithKey, selectMetaFromQuery, selectLoadingFromQuery } from '../selectors';

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
          groupedBy: 'participant'
        }
      },
    },
  };

  it('selects the correct query', () => {
    const query = selectQueryWithKey('uniqueKey')(INITIAL_STATE);

    expect(query).toEqual({
      loading: false, meta: { matches: 2 }, data: {
        groupedBy: 'participant'
      }
    });
  });

  it('selects the meta of the query', () => {
    const meta = selectMetaFromQuery('uniqueKey')(INITIAL_STATE);

    expect(meta).toEqual({ matches: 2 });
  });
});
