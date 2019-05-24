import { renderHook } from 'react-hooks-testing-library';

import useUpdatableState from './useUpdatableState';

describe('useUpdatableState', () => {
  it('should return the initial state and a update function', () => {
    const { result } = renderHook(() => useUpdatableState({ loading: true, data: 'test' }));

    const [state, setState] = result.current;

    expect(state).toEqual({ loading: true, data: 'test' });
    expect(setState).toBeInstanceOf(Function);
  });

  it('should return a new state object with the updated property', () => {
    const initialState = { loading: true, data: 'test' };

    const { result } = renderHook(() => useUpdatableState(initialState));

    const [, setState] = result.current;

    setState({ loading: false });

    const [newState] = result.current;

    // mutate initial state for testing purposes
    initialState.loading = false;

    expect(newState).not.toBe(initialState);
    expect(newState).toEqual({ loading: false, data: 'test' });
  });
});
