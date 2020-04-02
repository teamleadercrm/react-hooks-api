import {
  selectQueries,
  selectLoadingFromQueryFactory,
  selectMetaFromQueryFactory,
  selectQueryByKey,
  selectLoadingFromQueryWithUpdateQueriesFactory,
  selectIdsFromQuery,
  selectDomainNameFromQuery,
} from '../selectors';
import generateQueryCacheKey from '../../../utils/generateQueryCacheKey';

describe('queries selectors', () => {
  const INITIAL_STATE: any = {
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
      uniqueKey2: {
        loading: true,
      },
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
          groupedBy: 'participant',
        },
      },
      uniqueKey2: {
        loading: true,
      },
    });
  });

  it('selects the correct query', () => {
    const query = selectQueryByKey(INITIAL_STATE, 'uniqueKey');

    expect(query).toEqual({
      loading: false,
      meta: { matches: 2 },
      data: {
        groupedBy: 'participant',
      },
    });
  });

  it('selects the loading state of the query', () => {
    const selectLoading = selectLoadingFromQueryFactory();
    const loading = selectLoading(INITIAL_STATE, 'uniqueKey');

    expect(loading).toBeFalsy();
  });

  it('selects the meta of the query', () => {
    const selectMeta = selectMetaFromQueryFactory();
    const meta = selectMeta(INITIAL_STATE, 'uniqueKey');

    expect(meta).toEqual({ matches: 2 });
  });

  it('selects the combined loading state of multiple queries', () => {
    const selectLoadingFromQueryWithUpdateQueries = selectLoadingFromQueryWithUpdateQueriesFactory();

    const loading = selectLoadingFromQueryWithUpdateQueries(INITIAL_STATE, 'uniqueKey', ['uniqueKey2']);

    expect(loading).toBeTruthy();
  });

  it('selects the ids from a query', () => {
    INITIAL_STATE.queries = {
      uniqueKey3: {
        loading: false,
        ids: ['id1', 'id2'],
      },
    };
    const ids = selectIdsFromQuery(INITIAL_STATE, 'uniqueKey3');
    expect(ids).toEqual(['id1', 'id2']);
  });

  it('selects the domain of a query', () => {
    const key = generateQueryCacheKey({ domain: 'projects' });
    INITIAL_STATE.queries = {
      [key]: {},
    };

    const domain = selectDomainNameFromQuery(INITIAL_STATE, key);
    expect(domain).toEqual('projects');
  });
});
