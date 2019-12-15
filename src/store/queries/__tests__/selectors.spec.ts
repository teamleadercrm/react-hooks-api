import { selectQueries, selectLoadingFromQueryFactory, selectMetaFromQueryFactory, selectQueryByKey, selectLoadingFromQueryWithUpdateQueriesFactory } from '../selectors';

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
      uniqueKey2: {
        loading: true,
      }
    },
  };

  it('selects the queries state', () => {
    const queries = selectQueries(INITIAL_STATE);

    expect(queries).toEqual({
      uniqueKey: {
        loading: false,
        meta: {
          matches: 2,
        },
        data: {
          groupedBy: 'participant'
        }
      },
      uniqueKey2: {
        loading: true,
      }
    });
  });

  it('selects the correct query', () => {
    const query = selectQueryByKey(INITIAL_STATE, 'uniqueKey');

    expect(query).toEqual({
      loading: false, meta: { matches: 2 }, data: {
        groupedBy: 'participant'
      }
    });
  });

  it('selects the loading state of the query', () => {
    const selectLoading = selectLoadingFromQueryFactory();
    const loading = selectLoading(INITIAL_STATE, 'uniqueKey');

    expect(loading).toBeFalsy();
  })

  it('selects the meta of the query', () => {
    const selectMeta = selectMetaFromQueryFactory();
    const meta = selectMeta(INITIAL_STATE, 'uniqueKey');

    expect(meta).toEqual({ matches: 2 });
  });

  it('selects the combined loading state of multiple queries', () => {
    const selectLoadingFromQueryWithUpdateQueries = selectLoadingFromQueryWithUpdateQueriesFactory();

    const loading = selectLoadingFromQueryWithUpdateQueries(INITIAL_STATE, 'uniqueKey', ['uniqueKey2']);

    expect(loading).toBeTruthy();
  })
});
