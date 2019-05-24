import * as React from 'react';
import { Provider as ReactReduxProvider } from 'react-redux';
import { Store } from 'redux';

import Context from './Context';

type ProviderProps = {
  api: any;
  store: Store;
};

const Provider: React.FunctionComponent<ProviderProps> = ({ api, store, children }) => {
  return (
    <Context.Provider value={api}>
      <ReactReduxProvider store={store}>{children}</ReactReduxProvider>
    </Context.Provider>
  );
};

export default Provider;
