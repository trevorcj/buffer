import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  hasCompletedOnboarding: boolean;
  transactionPin: string | null;
}

const initialState: AuthState = {
  token: null,
  hasCompletedOnboarding: false,
  transactionPin: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession(
      state,
      action: PayloadAction<{
        token: string;
        hasCompletedOnboarding: boolean;
        transactionPin?: string | null;
      }>,
    ) {
      state.token = action.payload.token;
      state.hasCompletedOnboarding = action.payload.hasCompletedOnboarding;

      if (action.payload.transactionPin !== undefined) {
        state.transactionPin = action.payload.transactionPin;
      }
    },
    setTransactionPin(state, action: PayloadAction<string>) {
      state.transactionPin = action.payload;
    },
    completeOnboarding(state) {
      state.hasCompletedOnboarding = true;
    },
    logout() {
      return initialState;
    },
  },
});

export const { setSession, setTransactionPin, completeOnboarding, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
