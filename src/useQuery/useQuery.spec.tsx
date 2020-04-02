// @ts-nocheck
import React from 'react';
import { Provider as ReactReduxProvider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { renderHook } from '@testing-library/react-hooks';
import { Store } from 'redux';
import { act } from 'react-test-renderer';

import useQuery from './useQuery';
import generateQueryCacheKey from '../utils/generateQueryCacheKey';
import Context from '../Context';
import CustomReduxContext from '../store/CustomReduxContext';
import { queryRequest, querySuccess } from '../store/queries/actions';
import { saveNormalizedEntities } from '../store/entities/actions';
import { State } from '../store/reducer';

const mockAPI = {
  users: {
    // a list request will always resolve
    list: (options) => {
      return new Promise((resolve, reject) => {
        if (options && options.page === 2) {
          resolve({ data: [{ id: 'e57a6047-cb52-4273-9df7-1d55c2c6e36d' }] });
        }
        resolve({
          data: [{ id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706' }, { id: '708c8008-3455-49a9-b66a-5222bcadb0cc' }],
        });
      });
    },
    info: (options) => {
      // an info request will reject
      return new Promise((resolve, reject) => {
        const error = new Error('API-Error');
        reject(error);
      });
    },
  },
  projects: {
    list: jest.fn(),
  },
  projectItems: {
    report: () => {
      return new Promise((resolve) => {
        resolve({
          data: [
            {
              billable_amount: { amount: 63.05, currency: 'EUR' },
              cost: { amount: 100, currency: 'EUR' },
              result: { amount: -36.95, currency: 'EUR' },
              type: 'tracked_time',
              quantity: 1,
              unit: 'hour',
            },
          ],
        });
      });
    },
  },
};

const initialMockState: State = {
  entities: {},
  queries: {},
};

const mockedStateAfterUsersListResolve = {
  queries: {
    [generateQueryCacheKey({ domain: 'users', action: 'list' })]: {
      loading: false,
      ids: ['e6538393-aa7e-4ec2-870b-f75b3d85f706', '708c8008-3455-49a9-b66a-5222bcadb0cc'],
    },
  },
  entities: {
    users: {
      'e6538393-aa7e-4ec2-870b-f75b3d85f706': {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
      },
      '708c8008-3455-49a9-b66a-5222bcadb0cc': {
        id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
      },
    },
  },
};

const StoreWrapper = (passedStore?: Store) => {
  let store = passedStore;
  // initialize a default store
  if (!passedStore) {
    store = configureStore([])(() => initialMockState);
  }

  return ({ children }) => (
    <ReactReduxProvider context={CustomReduxContext} store={store}>
      <Context.Provider value={mockAPI}>{children}</Context.Provider>
    </ReactReduxProvider>
  );
};

describe('useQuery', () => {
  it('should initially return a loading state and a fetchMore function', async () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'list',
    });

    const { result } = renderHook(() => useQuery(QUERY), {
      wrapper: StoreWrapper(),
    });

    expect(result.current.loading).toEqual(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeUndefined();
    expect(result.current.fetchMore).toBeInstanceOf(Function);
  });

  it.skip('should dispatch a queryRequest action when a query is requested for the first time', async () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'list',
    });

    const store = configureStore([])({ queries: {} });

    renderHook(() => useQuery(QUERY), { wrapper: StoreWrapper(store) });

    const key = generateQueryCacheKey({ domain: 'users', action: 'list' });

    const action = queryRequest({ key, APIContext: {} });

    expect(store.getActions()).toEqual([action]);
  });

  // @TODO move to middleware test
  it.skip('should dispatch a querySuccess and saveNormalizedEntities action when a query is successfully resolved', async () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'list',
    });

    const key = generateQueryCacheKey({ domain: 'users', action: 'list' });

    let state = { ...initialMockState };
    const store = configureStore([])(() => state);

    const { waitForNextUpdate } = renderHook(() => useQuery(QUERY), { wrapper: StoreWrapper(store) });

    state = mockedStateAfterUsersListResolve;

    await waitForNextUpdate();

    const actions = [
      querySuccess({
        key,
        ids: ['e6538393-aa7e-4ec2-870b-f75b3d85f706', '708c8008-3455-49a9-b66a-5222bcadb0cc'],
      }),
      saveNormalizedEntities({
        type: 'users',
        entities: {
          'e6538393-aa7e-4ec2-870b-f75b3d85f706': {
            id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
          },
          '708c8008-3455-49a9-b66a-5222bcadb0cc': {
            id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
          },
        },
      }),
    ];

    const allActions = store.getActions();
    // skip first request action
    allActions.shift();

    expect(allActions).toEqual(actions);
  });

  it.skip('should return the resolved data', async () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'list',
    });

    const key = generateQueryCacheKey({ domain: 'users', action: 'list' });

    let state = { ...initialMockState };
    const store = configureStore([])(() => state);

    const { result, waitForNextUpdate } = renderHook(() => useQuery(QUERY), { wrapper: StoreWrapper(store) });

    state = mockedStateAfterUsersListResolve;

    await waitForNextUpdate();

    expect(result.current.loading).toEqual(false);
    expect(result.current.data).toEqual([
      {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
      },
      {
        id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
      },
    ]);
  });

  it.skip('should save the data on a query level when the action is not "info" or "list"', async () => {
    const QUERY = () => ({
      domain: 'projectItems',
      action: 'report',
    });

    const key = generateQueryCacheKey(QUERY());

    let state = { ...initialMockState };
    const store = configureStore([])(() => state);

    const data = [
      {
        billable_amount: { amount: 63.05, currency: 'EUR' },
        cost: { amount: 100, currency: 'EUR' },
        result: { amount: -36.95, currency: 'EUR' },
        type: 'tracked_time',
        quantity: 1,
        unit: 'hour',
      },
    ];

    const { waitForNextUpdate } = renderHook(() => useQuery(QUERY), { wrapper: StoreWrapper(store) });

    state = {
      entities: {},
      queries: {
        [key]: {
          loading: false,
          data,
        },
      },
    };

    await waitForNextUpdate();

    const actions = [
      querySuccess({
        key,
        data,
      }),
    ];

    const allActions = store.getActions();
    // skip first request action
    allActions.shift();

    expect(allActions).toEqual(actions);
  });

  it.skip('should return the error if the API request fails', async () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'info',
    });

    const { result, waitForNextUpdate } = renderHook(() => useQuery(QUERY), { wrapper: StoreWrapper() });

    await waitForNextUpdate();

    expect(result.current.loading).toEqual(false);
    expect(result.current.error).toEqual(new Error('API-Error'));
  });

  it.skip('should return the cached value instantly if it is available', () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'list',
    });

    const store = configureStore([])(mockedStateAfterUsersListResolve);

    const { result } = renderHook(() => useQuery(QUERY), { wrapper: StoreWrapper(store) });

    expect(result.current.loading).toEqual(false);
    expect(result.current.data).toEqual([
      {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
      },
      {
        id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
      },
    ]);
  });

  it.skip('should clear the error when variables have changed', async () => {
    const FAIL_QUERY = () => ({
      domain: 'users',
      action: 'info',
    });

    const SUCCESS_QUERY = () => ({
      domain: 'users',
      action: 'list',
    });

    const { result, waitForNextUpdate, rerender } = renderHook(({ query }) => useQuery(query), {
      wrapper: StoreWrapper(),
      initialProps: { query: FAIL_QUERY },
    });

    await waitForNextUpdate();

    act(() => {
      rerender({ query: SUCCESS_QUERY });
    });

    expect(result.current.loading).toEqual(true);
    expect(result.current.error).toBeUndefined();
  });

  it.skip('should load more data using new variables and a specified update function', async () => {
    const QUERY = ({ page }) => ({
      domain: 'users',
      action: 'list',
      options: {
        page,
      },
    });

    let state = initialMockState;
    const store = configureStore([])(() => state);

    const { result, waitForNextUpdate } = renderHook(() => useQuery(QUERY, { page: 1 }), {
      wrapper: StoreWrapper(store),
    });

    state = {
      ...mockedStateAfterUsersListResolve,
      queries: {
        [generateQueryCacheKey({ domain: 'users', action: 'list', options: { page: 1 } })]: {
          loading: false,
          ids: ['e6538393-aa7e-4ec2-870b-f75b3d85f706', '708c8008-3455-49a9-b66a-5222bcadb0cc'],
        },
      },
    };
    await waitForNextUpdate();

    act(() => {
      result.current.fetchMore({
        variables: { page: 2 },
        updateQuery: ({ previousData, data }) => [...previousData, ...data],
      });
    });

    expect(result.current.loading).toBeTruthy();

    state = {
      entities: {
        users: {
          ...state.entities.users,
          'e57a6047-cb52-4273-9df7-1d55c2c6e36d': {
            id: 'e57a6047-cb52-4273-9df7-1d55c2c6e36d',
          },
        },
      },
      queries: {
        ...state.queries,
        [generateQueryCacheKey({ domain: 'users', action: 'list', options: { page: 2 } })]: {
          loading: false,
          ids: ['e57a6047-cb52-4273-9df7-1d55c2c6e36d'],
        },
      },
    };
    await waitForNextUpdate();

    const resultData = [
      {
        id: 'e6538393-aa7e-4ec2-870b-f75b3d85f706',
      },
      {
        id: '708c8008-3455-49a9-b66a-5222bcadb0cc',
      },
      { id: 'e57a6047-cb52-4273-9df7-1d55c2c6e36d' },
    ];

    expect(result.current.loading).toEqual(false);
    expect(result.current.data).toEqual(resultData);
  });

  it.skip('should ignore the store when the ignoreCache option is passed', async () => {
    const QUERY = () => ({
      domain: 'projects',
      action: 'list',
    });

    const storeKey = generateQueryCacheKey(QUERY());

    const store = configureStore([])({
      entities: {
        projects: {
          'e57a6047-cb52-4273-9df7-1d55c2c6e36d': {
            key: 'cached',
          },
        },
      },
      queries: {
        [storeKey]: {
          ids: ['e57a6047-cb52-4273-9df7-1d55c2c6e36d'],
        },
      },
    });

    mockAPI.projects.list.mockReturnValueOnce(
      new Promise((resolve) => {
        resolve({
          data: [],
        });
      })
    );

    const { result, waitForNextUpdate } = renderHook(() => useQuery(QUERY, {}, { ignoreCache: true }), {
      wrapper: StoreWrapper(store),
    });

    await waitForNextUpdate();

    expect(mockAPI.projects.list).toHaveBeenCalled();
  });
});
