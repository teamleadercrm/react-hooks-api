import { useEffect, useContext, useCallback, useMemo } from 'react';

import generateQueryCacheKey from '../utils/generateQueryCacheKey';
import useUpdatableState from '../utils/useUpdatableState';
import normalize from '../utils/normalize';
import { Response } from '../typings/API';

import { queryRequest, querySuccess, queryFailure } from '../store/queries/actions';
import CustomReduxContext from '../store/CustomReduxContext';
import Context from '../Context';
import { saveNormalizedEntities } from '../store/entities/actions';
import { selectMergedEntities } from '../store/entities/selectors';
import { selectQuery, selectMetaFromQuery } from '../store/queries/selectors';
import { TYPE_DOMAIN_MAPPING } from '../store/entities/constants';

type CalculatedQuery = {
  domain: string;
  action: string;
  options?: any;
};

type Query = (variables?: any) => CalculatedQuery;

type FetchPolicy = 'cache-first' | 'cache-and-network' | 'network-only';

type Options = {
  ignoreCache?: boolean;
  fetchAll?: boolean;
  fetchPolicy: FetchPolicy;
};

export const queries: Record<string, { fetch: () => void; _linkedQueriesFetches: Record<string, () => void> }> = {};
let uniqueHookIndex = 0;

const defaultConfig: Options = {
  ignoreCache: false,
  fetchAll: false,
  fetchPolicy: 'cache-first',
};

const useQuery: (query: Query, variables?: any, options?: Options) => any = (
  query,
  variables,
  {
    ignoreCache = defaultConfig.ignoreCache,
    fetchAll = defaultConfig.fetchAll,
    fetchPolicy = defaultConfig.fetchPolicy,
  } = defaultConfig,
) => {
  // Backwards compatibility for the deprecated ignoreCache option
  if (ignoreCache) {
    fetchPolicy = 'network-only';
  }

  const uniqueId = useMemo(() => {
    const localIndex = uniqueHookIndex;
    uniqueHookIndex++;
    return localIndex;
  }, []);

  const queryKey = generateQueryCacheKey(query(variables));
  // Get the redux store
  // this only works because our store is immutable and won't trigger
  // a re-render when it gets updated
  const { store } = useContext(CustomReduxContext);

  const initialState = useMemo(() => {
    if (fetchPolicy === 'cache-first' || fetchPolicy === 'cache-and-network') {
      // Check for previous results
      const cacheResult = selectQuery(store.getState(), queryKey);
      if (cacheResult) {
        const data = selectMergedEntities(store.getState(), { key: queryKey });
        const meta = selectMetaFromQuery(store.getState(), queryKey);

        return { loading: false, data, meta, error: undefined };
      }
    }

    return {
      loading: false,
      data: undefined,
      error: undefined,
      meta: undefined,
    };
  }, []);
  const [state, setState] = useUpdatableState(initialState);

  const API = useContext(Context);

  // Helper callback function that does the actual request
  const requestData = useCallback(
    (domain, action, options, updateQuery) => {
      const key = generateQueryCacheKey({ domain, action, options });
      const isEntityAction = action === 'info' || action === 'list';
      switch (fetchPolicy) {
        case 'cache-first':
          {
            // Check for previous results
            const cacheResult = selectQuery(store.getState(), key);
            if (cacheResult) {
              const data = selectMergedEntities(store.getState(), { key });
              const meta = selectMetaFromQuery(store.getState(), key);

              setState({ loading: false, data, meta, error: undefined });
              // Early return prevents a request from being sent out
              return;
            }
          }
          break;
        case 'cache-and-network':
          {
            // Check for previous results
            const cacheResult = selectQuery(store.getState(), key);
            if (cacheResult) {
              const data = selectMergedEntities(store.getState(), { key });
              const meta = selectMetaFromQuery(store.getState(), key);
              setState({ loading: false, data, meta, error: undefined });
            } else {
              store.dispatch(queryRequest({ key }));
              setState({ loading: true, error: undefined });
            }
          }
          break;
        case 'network-only':
          {
            store.dispatch(queryRequest({ key }));
            setState({ loading: true, error: undefined });
          }
          break;
      }

      // @TODO this promise should be cancellable
      API[domain][action](options, { fetchAll })
        .then((response: Response) => {
          store.dispatch(
            querySuccess({
              key,
              ...(isEntityAction && {
                ids: Array.isArray(response.data) ? response.data.map((entity) => entity.id) : response.data.id,
              }),
              ...(!isEntityAction && { data: response.data }),
              meta: response.meta,
            }),
          );

          if (isEntityAction) {
            const mainEntities = normalize(response.data);
            store.dispatch(saveNormalizedEntities({ type: domain, entities: mainEntities }));
          }

          if (response.included) {
            Object.keys(response.included).forEach((entityType) => {
              const normalizedEntities = normalize(response.included[entityType]);
              const domainFromType = TYPE_DOMAIN_MAPPING[entityType];
              store.dispatch(saveNormalizedEntities({ type: domainFromType, entities: normalizedEntities }));
            });
          }

          const data = selectMergedEntities(store.getState(), { key });
          const meta = selectMetaFromQuery(store.getState(), key);

          setState({
            loading: false,
            data: updateQuery ? updateQuery({ previousData: state.data, data }) : data,
            meta,
            error: undefined,
          });
        })
        .catch((error) => {
          store.dispatch(queryFailure({ key, error }));
          setState({ loading: false, error });
        });
    },
    [state.data],
  );

  // Effect only runs when the result query (with variables) has changed
  useEffect(() => {
    const { domain, action, options } = query(variables);
    requestData(domain, action, options, null);
  }, [queryKey]);

  // Function supplied to do a refetch with new variables
  // Takes an updateQuery variable that allows you to specify how
  // The data should be merged
  const fetchMore = useCallback(
    ({ variables: newVariables, updateQuery }) => {
      const { domain, action, options } = query(newVariables);
      requestData(domain, action, options, updateQuery);
    },
    [queryKey, state.data],
  );

  /*
   * Register the query in a global object
   * @TODO this should probably be set in the store instead
   * so we don't pollute the global scope, but for now, it doesn't hurt
   */
  useEffect(() => {
    // Already has a query registered
    if (queries[queryKey]) {
      queries[queryKey]._linkedQueriesFetches = {
        ...queries[queryKey]._linkedQueriesFetches,
        [uniqueId]: (): void => fetchMore({ variables }),
      };
    } else {
      queries[queryKey] = {
        fetch: (): void => {
          Object.values(queries[queryKey]?._linkedQueriesFetches || []).forEach((fetch) => fetch());
        },
        _linkedQueriesFetches: {
          ...queries[queryKey]?._linkedQueriesFetches,
          [uniqueId]: (): void => fetchMore({ variables }),
        },
      };
    }

    return function cleanup() {
      delete queries[queryKey]?._linkedQueriesFetches?.[uniqueId];
    };
  }, [queryKey]);

  return { ...state, fetchMore };
};

export default useQuery;
