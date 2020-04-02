import * as React from 'react';
import { createStoreHook, createDispatchHook, createSelectorHook } from 'react-redux';

const Context: any = React.createContext(null);

export const useStore = createStoreHook(Context);
export const useDispatch = createDispatchHook(Context);
export const useSelector = createSelectorHook(Context);

export default Context;
