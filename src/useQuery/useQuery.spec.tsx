import React from 'react';
import { Provider as ReactReduxProvider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { renderHook } from '@testing-library/react-hooks';
import { Store } from 'redux';

import useQuery from './useQuery';
import generateQueryCacheKey from '../utils/generateQueryCacheKey';
import { CACHE_QUERY_RESULT } from '../store/constants';
import Context from '../Context';
import CustomReduxContext from '../store/CustomReduxContext';

const mockAPI = {
  users: {
    // a list request will always resolve
    list: options => {
      return new Promise((resolve, reject) => {
        if (options && options.page === 2) {
          resolve('more data');
        }
        resolve('data');
      });
    },
    info: options => {
      // an info request will reject
      return new Promise((resolve, reject) => {
        const error = new Error('API-Error');
        reject(error);
      });
    },
  },
};

const StoreWrapper = (passedStore?: Store) => {
  let store = passedStore;
  // initialize a default store
  if (!passedStore) {
    store = configureStore([])({ queries: {} });
  }

  return ({ children }) => (
    <ReactReduxProvider context={CustomReduxContext} store={store}>
      <Context.Provider value={mockAPI}>{children}</Context.Provider>
    </ReactReduxProvider>
  );
};

describe('useQuery', () => {
  it('should initially return a loading state and a fetchMore function', () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'list',
    });

    const { result } = renderHook(() => useQuery(QUERY), {
      wrapper: StoreWrapper(),
    });

    expect(result.current.loading).toEqual(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.fetchMore).toBeInstanceOf(Function);
  });

  it('should dispatch a caching action when the resolved data is not cached yet', async () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'list',
    });

    const store = configureStore([])({ queries: {} });

    const { waitForNextUpdate } = renderHook(() => useQuery(QUERY), { wrapper: StoreWrapper(store) });

    // wait for request to resolve
    await waitForNextUpdate();

    const expectedType = CACHE_QUERY_RESULT;
    const expectedPayload = {
      domain: 'users',
      action: 'list',
      data: 'data',
    };

    expect(store.getActions()).toEqual([{ type: expectedType, payload: expectedPayload }]);
  });

  it('should return the resolved data', async () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'list',
    });

    const { result, waitForNextUpdate } = renderHook(() => useQuery(QUERY), { wrapper: StoreWrapper() });

    await waitForNextUpdate();

    expect(result.current.loading).toEqual(false);
    expect(result.current.data).toEqual('data');
  });

  it('should return the error if the API request fails', async () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'info',
    });

    const { result, waitForNextUpdate } = renderHook(() => useQuery(QUERY), { wrapper: StoreWrapper() });

    await waitForNextUpdate();

    expect(result.current.loading).toEqual(false);
    expect(result.current.error).toEqual(new Error('API-Error'));
  });

  it('should return the cached value instantly if it is available', () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'list',
    });

    const storeKey = generateQueryCacheKey(QUERY());

    const store = configureStore([])({ queries: { [storeKey]: 'cachedData' } });

    const { result } = renderHook(() => useQuery(QUERY), { wrapper: StoreWrapper(store) });

    expect(result.current.loading).toEqual(false);
    expect(result.current.data).toEqual('cachedData');
  });

  it('should clear the error when variables have changed', async () => {
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

    rerender({ query: SUCCESS_QUERY });

    expect(result.current.loading).toEqual(true);
    expect(result.current.error).toBeUndefined();
  });

  it('should load more data using new variables and a specified update function', async () => {
    const QUERY = ({ page }) => ({
      domain: 'users',
      action: 'list',
      options: {
        page,
      },
    });

    const { result, waitForNextUpdate } = renderHook(() => useQuery(QUERY, { page: 1 }), { wrapper: StoreWrapper() });

    await waitForNextUpdate();

    result.current.fetchMore({
      variables: { page: 2 },
      updateQuery: ({ previousData, data }) => [previousData, data],
    });

    expect(result.current.loading).toBeTruthy();

    await waitForNextUpdate();

    expect(result.current.loading).toEqual(false);
    expect(result.current.data).toEqual(['data', 'more data']);
  });

  it('should ignore the store when the ignoreCache option is passed', async () => {
    const QUERY = () => ({
      domain: 'users',
      action: 'list',
    });

    const storeKey = generateQueryCacheKey(QUERY());

    const store = configureStore([])({ queries: { [storeKey]: 'cachedData' } });

    const { result, waitForNextUpdate } = renderHook(() => useQuery(QUERY, {}, { ignoreCache: true }), {
      wrapper: StoreWrapper(store),
    });

    await waitForNextUpdate();

    expect(result.current.data).toEqual('data');
  });
});
