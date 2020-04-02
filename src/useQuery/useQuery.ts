import { useEffect, useContext, useCallback, useMemo } from 'react';

import generateQueryCacheKey from '../utils/generateQueryCacheKey';

import { queryRequest } from '../store/queries/actions';
import { useSelector, useDispatch } from '../store/CustomReduxContext';
import Context from '../Context';
import { selectEntitiesFromQueryFactory } from '../store/entities/selectors';
import { selectLoadingFromQueryFactory, selectMetaFromQueryFactory } from '../store/queries/selectors';
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

const defaultConfig = {
  ignoreCache: false,
  fetchAll: false,
};

const useQuery: (query: Query, variables?: any, options?: Options) => any = (
  query,
  variables,
  { ignoreCache = defaultConfig.ignoreCache, fetchAll = defaultConfig.fetchAll }: Options = defaultConfig,
) => {
  const key = useMemo(() => generateQueryCacheKey(query(variables)), [variables]);

  const API = useContext(Context);
  const selectLoading = useMemo(selectLoadingFromQueryFactory, []);
  const selectData = useMemo(selectEntitiesFromQueryFactory, []);
  const selectMeta = useMemo(selectMetaFromQueryFactory, []);
  const dispatch = useDispatch();

  const loading = useSelector((state: State) => selectLoading(state, key));
  const data = useSelector(state => selectData(state, key));
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
  // @TODO refactor this so it works with our new redux flow
  const fetchMore = useCallback(
    ({ variables: newVariables, updateQuery }) => {
      if (!ignoreCache && data) {
        return;
      }
      dispatch(queryRequest({ key: generateQueryCacheKey(query(newVariables)), APIContext: API }));
    },
    [key, ignoreCache, data],
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
