import { useEffect, useContext, useCallback, useMemo, useState } from 'react';

import generateQueryCacheKey from '../utils/generateQueryCacheKey';
import normalize from '../utils/normalize';
import { Response } from '../typings/API';

import { queryRequest, querySuccess, queryFailure } from '../store/queries/actions';
import { useSelector } from '../store/CustomReduxContext';
import Context from '../Context';
import { saveNormalizedEntities } from '../store/entities/actions';
import { selectMergedEntitiesFactory } from '../store/entities/selectors';
import { selectLoadingFromQueryFactory, selectMetaFromQueryFactory } from '../store/queries/selectors';
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
  const key = useMemo(() => generateQueryCacheKey(query(variables)), [variables]);

  const API = useContext(Context);
  const selectLoading = useMemo(selectLoadingFromQueryFactory, []);
  const selectData = useMemo(selectMergedEntitiesFactory, []);
  const selectMeta = useMemo(selectMetaFromQueryFactory, []);
  const dispatch = useDispatch();

  const loading = useSelector(state => selectLoading(state, key));
  const data = useSelector(state => selectData(state, key));
  const meta = useSelector(state => selectMeta(state, key));

  // Helper callback function that does the actual request
  const requestData = useCallback(
    (domain, action, options) => {
      const isEntityAction = action === 'info' || action === 'list';

      if (!ignoreCache && data) {
        return;
      }

      dispatch(queryRequest({ key }));

      // @TODO this promise should be cancellable
      API[domain][action](options)
        .then((response: Response) => {
          if (!isEntityAction) {
            Object.keys(response.included || {}).forEach(entityType => {
              const normalizedEntities = normalize(response.included[entityType]);
              const domainFromType = TYPE_DOMAIN_MAPPING[entityType];
              dispatch(saveNormalizedEntities({ type: domainFromType, entities: normalizedEntities }));
            });

            dispatch(
              querySuccess({
                key,
                data: response.data,
                meta: response.meta,
              }),
            );

            return;
          }

          const mainEntities = normalize(response.data);
          dispatch(saveNormalizedEntities({ type: domain, entities: mainEntities }));

          Object.keys(response.included || {}).forEach(entityType => {
            const normalizedEntities = normalize(response.included[entityType]);
            const domainFromType = TYPE_DOMAIN_MAPPING[entityType];
            dispatch(saveNormalizedEntities({ type: domainFromType, entities: normalizedEntities }));
          });

          dispatch(
            querySuccess({
              key,
              ids: Array.isArray(response.data) ? response.data.map(entity => entity.id) : response.data.id,
              meta: response.meta,
            }),
          );
        })
        .catch(error => {
          dispatch(queryFailure({ key, error }));
        });
    },
    [data],
  );

  // Effect only runs when the result query (with variables) has changed
  useEffect(() => {
    const { domain, action, options } = query(variables);
    requestData(domain, action, options);
  }, [key]);

  // Function supplied to do a refetch with new variables
  // Takes an updateQuery variable that allows you to specify how
  // The data should be merged
  // @TODO refactor this so it works with our new redux flow
  const fetchMore = useCallback(
    ({ variables: newVariables, updateQuery }) => {
      const { domain, action, options } = query(newVariables);
      requestData(domain, action, options);
    },
    [key, data],
  );

  return { loading, data, meta, fetchMore };
};

export default useQuery;
