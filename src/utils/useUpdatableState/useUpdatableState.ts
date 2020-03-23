import { useState } from 'react';

/**
 * This hook allows you to just update the current state instead
 * of fully replacing it, useful when your state is an object
 */
const useUpdatableState = <State extends object, Update = Partial<State> | ((prevState: State) => void)>(
  initialState: State,
): [State, (update: Update) => void] => {
  const [state, set] = useState(initialState);
  const setState = (update: Update) => {
    set((prevState) => Object.assign({}, prevState, update instanceof Function ? update(prevState) : update));
  };

  return [state, setState];
};

export default useUpdatableState;
