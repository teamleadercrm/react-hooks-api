import { useEffect, useContext, useCallback } from 'react';

import generateQueryCacheKey from '../utils/generateQueryCacheKey';
import useUpdatableState from '../utils/useUpdatableState';

import { cacheQueryResult } from '../store/actions';
import CustomReduxContext from '../store/CustomReduxContext';
import Context from '../Context';

type CalculatedQuery = {
  domain: string;
  action: string;
  options?: any;
};

type Query = (variables?: any) => CalculatedQuery;

type Options = {
  ignoreCache: boolean;
};

const selectQueryData = (state, key) => {
  return state.queries[key];
};

const defaultConfig = {
  ignoreCache: false,
};

const useQuery: (query: Query, variables?: any, options?: Options) => any = (
  query,
  variables,
  { ignoreCache = defaultConfig.ignoreCache } = defaultConfig,
) => {
  const [state, setState] = useUpdatableState({
    loading: false,
    data: undefined,
    error: undefined,
  });

  const API = useContext(Context);

  // Get the redux store
  // this only works because our store is immutable and won't trigger
  // a re-render when it gets updated
  const { store } = useContext(CustomReduxContext);

  // Helper callback function that does the actual request
  const requestData = useCallback(
    (domain, action, options, updateQuery) => {
      const key = generateQueryCacheKey({ domain, action, options });

      if (!ignoreCache) {
        // Check for previous results
        const cacheResult = selectQueryData(store.getState(), key);
        if (cacheResult) {
          setState({ loading: false, data: cacheResult, error: undefined });
          return;
        }
      }

      setState({ loading: true, error: undefined });

      // @TODO this promise should be cancellable
      API[domain][action](options)
        .then(data => {
          if (!ignoreCache) {
            store.dispatch(cacheQueryResult({ domain, action, options, data }));
          }

          setState({
            loading: false,
            data: updateQuery ? updateQuery({ previousData: state.data, data }) : data,
          });
        })
        .catch(error => setState({ loading: false, error }));
    },
    [state.data],
  );

  // Effect only runs when the result query (with variables) has changed
  useEffect(() => {
    const { domain, action, options } = query(variables);
    requestData(domain, action, options, null);
  }, [generateQueryCacheKey(query(variables))]);

  // Function supplied to do a refetch with new variables
  // Takes an updateQuery variable that allows you to specify how
  // The data should be merged
  const fetchMore = useCallback(
    ({ variables: newVariables, updateQuery }) => {
      const { domain, action, options } = query(newVariables);
      requestData(domain, action, options, updateQuery);
    },
    [generateQueryCacheKey(query(variables)), state.data],
  );

  return { ...state, fetchMore };
};

export default useQuery;
