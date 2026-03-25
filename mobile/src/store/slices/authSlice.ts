import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  hasCompletedOnboarding: boolean;
}

const initialState: AuthState = {
  token: null,
  hasCompletedOnboarding: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{ token: string; hasCompletedOnboarding: boolean }>,
    ) {
      state.token = action.payload.token;
      state.hasCompletedOnboarding = action.payload.hasCompletedOnboarding;
    },
    completeOnboarding(state) {
      state.hasCompletedOnboarding = true;
    },
    logout() {
      return initialState;
    },
  },
});

export const { setSession, completeOnboarding, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
