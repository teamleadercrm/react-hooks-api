import { createStore, compose, applyMiddleware } from 'redux';

import fetcher from './fetcher';
import reducer from './reducer';

const composeEnhancers =
  typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        name: 'react-hooks-api',
      })
    : compose;

const enhancer = composeEnhancers(applyMiddleware(fetcher));

const store = createStore(reducer, enhancer);

export default store;
