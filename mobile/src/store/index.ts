import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { authReducer } from './slices/authSlice';
import { bufferReducer } from './slices/bufferSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  buffer: bufferReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type PersistedState = Pick<RootState, 'auth' | 'buffer'>;

export function createAppStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as RootState | undefined,
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];
