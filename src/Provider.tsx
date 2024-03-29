import * as React from 'react';
import { Provider as ReactReduxProvider } from 'react-redux';
import { Store } from 'redux';

import store from './store';
import CustomReduxContext from './store/CustomReduxContext';
import Context from './Context';

type ProviderProps = {
  api: any;
  store: Store;
};

const Provider: React.FunctionComponent<ProviderProps> = ({ api, children }) => {
  return (
    <ReactReduxProvider context={CustomReduxContext} store={store}>
      <Context.Provider value={api}>{children}</Context.Provider>
    </ReactReduxProvider>
  );
};

export default Provider;
