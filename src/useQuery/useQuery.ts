import { useEffect, useContext, useCallback, useMemo, useState } from 'react';

import generateQueryCacheKey from '../utils/generateQueryCacheKey';

import { queryRequest } from '../store/queries/actions';
import { useSelector, useDispatch } from '../store/CustomReduxContext';
import Context from '../Context';
import { selectEntitiesFromQueryFactory } from '../store/entities/selectors';
import { selectLoadingFromQueryFactory, selectMetaFromQueryFactory } from '../store/queries/selectors';

type CalculatedQuery = {
  domain: string;
  action: string;
  options?: any;
};

type Query = (variables?: any) => CalculatedQuery;

type Options = {
  ignoreCache: boolean;
};

export const queries: Record<string, { fetch: () => void }> = {};

const defaultConfig = {
  ignoreCache: false,
};

const useQuery: (query: Query, variables?: any, options?: Options) => any = (
  query,
  variables,
  { ignoreCache = defaultConfig.ignoreCache } = defaultConfig,
) => {
  const key = useMemo(() => generateQueryCacheKey(query(variables)), [variables]);

  const API = useContext(Context);
  const selectLoading = useMemo(selectLoadingFromQueryFactory, []);
  const selectData = useMemo(selectEntitiesFromQueryFactory, []);
  const selectMeta = useMemo(selectMetaFromQueryFactory, []);
  const dispatch = useDispatch();

  const loading = useSelector(state => selectLoading(state, key));
  const data = useSelector(state => selectData(state, key));
  const meta = useSelector(state => selectMeta(state, key));

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
  queries[key] = {
    // Function that can be called to refresh this specific query
    fetch: () => fetchMore({ variables }),
  }

  return { loading, data, meta, fetchMore };
};

export default useQuery;
