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
  selectErrorFromQueryFactory,
  selectErrorFromQueriesFactory,
} from '../store/queries/selectors';
import { State } from 'store/reducer';

type CalculatedQuery = {
  domain: string;
  action: string;
  options?: any;
};
type Query = (variables?: any) => CalculatedQuery;
type FetchPolicy = 'cache-first' | 'cache-and-network';
type Options = {
  ignoreCache?: boolean;
  fetchAll?: boolean;
  fetchPolicy?: FetchPolicy;
};
export const queries: Record<string, { fetch: () => void }> = {};
export type UpdateQueries = Record<string, (data: { previousData: any; data: any }) => any>;

const defaultConfig: Options = {
  ignoreCache: false,
  fetchPolicy: 'cache-first',
};

const useQuery: (query: Query, variables?: any, options?: Options) => any = (
  query,
  variables,
  { ignoreCache = defaultConfig.ignoreCache, fetchPolicy = defaultConfig.fetchPolicy }: Options = defaultConfig
) => {
  const key = useMemo(() => generateQueryCacheKey(query(variables)), [variables]);
  const [updateQueries, setUpdateQueries] = useState<UpdateQueries>({});
  const hasUpdateQueries = Object.keys(updateQueries).length !== 0;

  const API = useContext(Context);
  const selectLoading = useMemo(selectLoadingFromQueryFactory, []);
  const selectLoadingFromQueries = useMemo(selectLoadingFromQueriesFactory, []);
  const selectErrorFromQuery = useMemo(selectErrorFromQueryFactory, []);
  const selectErrorFromQueries = useMemo(selectErrorFromQueriesFactory, []);
  const selectData = useMemo(selectEntitiesFromQueryFactory, []);
  const selectDataWithUpdateQueries = useMemo(selectEntitiesFromQueryWithUpdateQueriesFactory, []);
  const selectMeta = useMemo(selectMetaFromQueryFactory, []);
  const dispatch = useDispatch();

  const loading = useSelector((state: State) =>
    hasUpdateQueries ? selectLoadingFromQueries(state, [key, ...Object.keys(updateQueries)]) : selectLoading(state, key)
  );
  const error = useSelector((state: State) =>
    hasUpdateQueries
      ? selectErrorFromQueries(state, [key, ...Object.keys(updateQueries)])
      : selectErrorFromQuery(state, key)
  );
  const data = useSelector((state) =>
    hasUpdateQueries ? selectDataWithUpdateQueries(state, key, updateQueries) : selectData(state, key)
  );

  const meta = useSelector((state: State) => selectMeta(state, key));

  // Effect only runs when the result query (with variables) has changed
  useEffect(() => {
    if (fetchPolicy === 'cache-first' && data) {
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

  const refresh = () => {
    dispatch(queryRequest({ key, APIContext: API }));
    if (hasUpdateQueries) {
      Object.keys(updateQueries).forEach((key) => dispatch(queryRequest({ key, APIContext: API })));
    }
  };

  /*
   * Register the query in a global object
   * @TODO this should probably be set in the store instead
   * so we don't pollute the global scope, but for now, it doesn't hurt
   */
  useEffect(() => {
    queries[key] = { fetch: refresh };
  }, [key]);

  return { loading, error, data, meta, fetchMore };
};

export default useQuery;
