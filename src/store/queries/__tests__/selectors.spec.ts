import {
  selectQueries,
  selectLoadingFromQueryFactory,
  selectMetaFromQueryFactory,
  selectQueriesByKeys,
  selectQueryByKey,
  selectIdsFromQuery,
  selectDomainNameFromQuery,
  selectLoadingFromQueriesFactory,
  selectFollowUpQueries,
  selectErrorFromQueryFactory,
  selectErrorFromQueriesFactory,
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

  describe('selectErrorFromQueryFactory', () => {
    const selectErrorFromQuery = selectErrorFromQueryFactory();

    it('selects the error object saved on a query', () => {
      INITIAL_STATE.queries = {
        key1: {
          error: 'An error',
        },
      };

      expect(selectErrorFromQuery(INITIAL_STATE, 'key1')).toEqual('An error');
    });
  });

  describe('selectErrorFromQueriesFactory', () => {
    const selectErrorFromQueries = selectErrorFromQueriesFactory();

    it('returns an array of all errors', () => {
      INITIAL_STATE.queries = {
        key1: {},
        key2: {
          error: 'Another error',
        },
      };

      expect(selectErrorFromQueries(INITIAL_STATE, ['key1', 'key2'])).toEqual(['Another error']);
    });
  });

  describe('selectQueriesByKeys', () => {
    it('selects all queries using passed keys', () => {
      const keys = ['key1', 'key2'];
      INITIAL_STATE.queries = {
        [keys[0]]: {
          id: 'key1',
        },
        [keys[1]]: {
          id: 'key2',
        },
      };

      expect(selectQueriesByKeys(INITIAL_STATE, keys)).toEqual([{ id: 'key1' }, { id: 'key2' }]);
    });
  });

  describe('selectLoadingFromQueriesFactory', () => {
    const selectLoadingFromQueries = selectLoadingFromQueriesFactory();
    it('selects the combined loading state of multiple queries', () => {
      const keys = ['key1', 'key2'];
      INITIAL_STATE.queries = {
        [keys[0]]: {
          loading: false,
        },
        [keys[1]]: {
          loading: true,
        },
      };
      const loading = selectLoadingFromQueries(INITIAL_STATE, keys);

      expect(loading).toBeTruthy();
    });
  });

  describe('selectFollowUpQueries', () => {
    it('selects and builds a collection of follow up queries', () => {
      const combine = ({ previousData, data }: { previousData: any; data: any }) => [...previousData, data];
      const updateQueries = {
        key1: combine,
        key2: combine,
      };
      INITIAL_STATE.queries = {
        key1: {
          loading: false,
          ids: ['id1', 'id2'],
        },
        key2: {
          loading: true,
        },
      };

      const followUpQueries = selectFollowUpQueries(INITIAL_STATE, null, updateQueries);
      expect(followUpQueries).toEqual([
        {
          loading: false,
          ids: ['id1', 'id2'],
          updateQuery: combine,
        },
        { loading: true, updateQuery: combine },
      ]);
    });
  });
});
