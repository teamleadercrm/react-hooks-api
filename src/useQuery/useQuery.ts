import { useEffect, useContext, useCallback } from 'react';

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
import { useDispatch } from '../store/CustomReduxContext';

type CalculatedQuery = {
  domain: string;
  action: string;
  options?: any;
};

type Query = (variables?: any) => CalculatedQuery;

type Options = {
  ignoreCache: boolean;
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
    meta: undefined,
  });

  const API = useContext(Context);

  // Get the redux store
  // this only works because our store is immutable and won't trigger
  // a re-render when it gets updated
  const { store } = useContext(CustomReduxContext);
  const dispatch = useDispatch();

  // Helper callback function that does the actual request
  const requestData = useCallback(
    (domain, action, options, updateQuery) => {
      const key = generateQueryCacheKey({ domain, action, options });
      const isEntityAction = action === 'info' || action === 'list';

      if (!ignoreCache) {
        // Check for previous results
        const cacheResult = selectQuery(store.getState(), key);
        if (cacheResult) {
          const data = selectMergedEntities(store.getState(), { key });
          const meta = selectMetaFromQuery(store.getState(), key);

          setState({ loading: false, data, meta, error: undefined });
          return;
        }
      }

      dispatch(queryRequest({ key }));
      setState({ loading: true, error: undefined });

      // @TODO this promise should be cancellable
      API[domain][action](options)
        .then((response: Response) => {
          dispatch(
            querySuccess({
              key,
              ...(isEntityAction && { ids: Array.isArray(response.data) ? response.data.map(entity => entity.id) : response.data.id }),
              ...(!isEntityAction && { data: response.data }),
              meta: response.meta,
            }),
          );

          if (isEntityAction) {
            const mainEntities = normalize(response.data);
            dispatch(saveNormalizedEntities({ type: domain, entities: mainEntities }));
          }

          if (response.included) {
            Object.keys(response.included).forEach(entityType => {
              const normalizedEntities = normalize(response.included[entityType]);
              const domainFromType = TYPE_DOMAIN_MAPPING[entityType];
              dispatch(saveNormalizedEntities({ type: domainFromType, entities: normalizedEntities }));
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
        .catch(error => {
          dispatch(queryFailure({ key, error }));
          setState({ loading: false, error });
        });
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
