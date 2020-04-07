import { useEffect, useContext, useCallback, useMemo, useState } from 'react';

import generateQueryCacheKey from '../utils/generateQueryCacheKey';

import { queryRequest } from '../store/queries/actions';
import { useSelector, useDispatch } from '../store/CustomReduxContext';
import Context from '../Context';
import {
  selectEntitiesFromQueryWithUpdateQueriesFactory,
  selectEntitiesFromQueryFactory,
} from '../store/entities/selectors';
import {
  selectLoadingFromQueryFactory,
  selectMetaFromQueryFactory,
  selectLoadingFromQueriesFactory,
} from '../store/queries/selectors';
import { State } from 'store/reducer';

type CalculatedQuery = {
  domain: string;
  action: string;
  options?: any;
};

type Query = (variables?: any) => CalculatedQuery;

type Options = {
  ignoreCache?: boolean;
  fetchAll?: boolean;
};

export const queries: Record<string, { fetch: () => void }> = {};

const registerQuery = (query: { fetch: () => void } | undefined, fetch: () => void) => {
  // A previous query has already been registered, hook up its fetch call as well
  // @TODO once every query relies on the same redux state object, this can be removed
  if (query) {
    return {
      fetch: () => {
        query.fetch();
        fetch();
      },
    };
  }

  return {
    fetch,
  };
};

export type UpdateQueries = Record<string, (data: { previousData: any; data: any }) => any>;

const defaultConfig = {
  ignoreCache: false,
};

const useQuery: (query: Query, variables?: any, options?: Options) => any = (
  query,
  variables,
  { ignoreCache = defaultConfig.ignoreCache }: Options = defaultConfig
) => {
  const key = useMemo(() => generateQueryCacheKey(query(variables)), [variables]);
  const [updateQueries, setUpdateQueries] = useState<UpdateQueries>({});
  const hasUpdateQueries = Object.keys(updateQueries).length !== 0;

  const API = useContext(Context);
  const selectLoading = useMemo(selectLoadingFromQueryFactory, []);
  const selectLoadingFromQueries = useMemo(selectLoadingFromQueriesFactory, []);
  const selectData = useMemo(selectEntitiesFromQueryFactory, []);
  const selectDataWithUpdateQueries = useMemo(selectEntitiesFromQueryWithUpdateQueriesFactory, []);
  const selectMeta = useMemo(selectMetaFromQueryFactory, []);
  const dispatch = useDispatch();

  const loading = useSelector((state: State) =>
    hasUpdateQueries ? selectLoadingFromQueries(state, [key, ...Object.keys(updateQueries)]) : selectLoading(state, key)
  );
  const data = useSelector((state) =>
    hasUpdateQueries ? selectDataWithUpdateQueries(state, key, updateQueries) : selectData(state, key)
  );

  const meta = useSelector((state: State) => selectMeta(state, key));

  // Effect only runs when the result query (with variables) has changed
  useEffect(() => {
    if (!ignoreCache && data) {
      return;
    }

    dispatch(queryRequest({ key, APIContext: API }));
  }, [key, ignoreCache]);

  // Function supplied to do a refetch with new variables
  // Takes an updateQuery variable that allows you to specify how
  // The data should be merged
  const fetchMore = useCallback(
    ({ variables: newVariables, updateQuery }) => {
      const fetchMoreKey = generateQueryCacheKey(query(newVariables));
      setUpdateQueries({ ...updateQueries, [fetchMoreKey]: updateQuery });
      dispatch(queryRequest({ key: fetchMoreKey, APIContext: API }));
    },
    [key, ignoreCache, data]
  );

  /*
   * Register the query in a global object
   * @TODO this should probably be set in the store instead
   * so we don't pollute the global scope, but for now, it doesn't hurt
   */
  useEffect(() => {
    queries[key] = registerQuery(queries[key], () => fetchMore({ variables }));
  }, [key]);

  return { loading, data, meta, fetchMore };
};

export default useQuery;
