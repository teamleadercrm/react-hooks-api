import { useEffect, useContext, useCallback } from 'react';
import { ReactReduxContext } from 'react-redux';

import generateQueryCacheKey from '../utils/generateQueryCacheKey';
import useUpdatableState from '../utils/useUpdatableState';

import { cacheQueryResult } from '../store/actions';
import Context from '../Context';

const selectQueryData = (state, key) => {
  return state.getIn(['queries', key]);
};

const useQuery = (query, variables) => {
  const [state, setState] = useUpdatableState({
    loading: false,
    data: undefined,
    error: undefined,
  });

  const API = useContext(Context);

  // Get the redux store
  // this only works because our store is immutable and won't trigger
  // a re-render when it gets updated
  const { store } = useContext(ReactReduxContext);

  // Helper callback function that does the actual request
  const requestData = useCallback(
    (domain, action, options, updateQuery) => {
      const key = generateQueryCacheKey({ domain, action, options });

      // Check for previous results
      const cacheResult = selectQueryData(store.getState(), key);
      if (cacheResult) {
        setState({ loading: false, data: cacheResult, error: undefined });
        return;
      }

      setState({ loading: true, error: undefined });

      // @TODO this promise should be cancellable
      API[domain][action](options)
        .then(data => {
          store.dispatch(cacheQueryResult({ domain, action, options, data }));

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
