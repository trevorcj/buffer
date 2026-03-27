import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { createEmptyDemoState, DemoState } from '../../services/mockApi';
import { CardStatus, UserSettings } from '../../types/domain';

interface BufferState extends DemoState {
  isBalanceVisible: boolean;
  isCardDetailsVisible: boolean;
}

const initialDemoState = createEmptyDemoState();

const initialState: BufferState = {
  ...initialDemoState,
  isBalanceVisible: true,
  isCardDetailsVisible: true,
};

const bufferSlice = createSlice({
  name: 'buffer',
  initialState,
  reducers: {
    replaceBufferState(state, action: PayloadAction<DemoState>) {
      state.profile = action.payload.profile;
      state.wallet = action.payload.wallet;
      state.settings = action.payload.settings;
      state.draftSettings = action.payload.draftSettings;
      state.cards = action.payload.cards;
      state.transactions = action.payload.transactions;
      state.isBalanceVisible = true;
      state.isCardDetailsVisible = true;
    },
    updateProfileIdentity(
      state,
      action: PayloadAction<{
        type: 'BVN' | 'NIN';
        value: string;
      }>,
    ) {
      if (action.payload.type === 'BVN') {
        state.profile.bvn = action.payload.value;
      } else {
        state.profile.nin = action.payload.value;
      }

      state.profile.kycStatus = 'VERIFIED';
    },
    setDraftSettings(state, action: PayloadAction<UserSettings>) {
      state.draftSettings = action.payload;
    },
    commitDraftSettings(state) {
      state.settings = state.draftSettings;
    },
    updateSavingSettings(state, action: PayloadAction<UserSettings>) {
      state.settings = action.payload;
      state.draftSettings = action.payload;
    },
    toggleBalanceVisibility(state) {
      state.isBalanceVisible = !state.isBalanceVisible;
    },
    toggleCardDetailsVisibility(state) {
      state.isCardDetailsVisible = !state.isCardDetailsVisible;
    },
    toggleCardStatus(state, action: PayloadAction<string>) {
      state.cards = state.cards.map((card) => {
        if (card.id !== action.payload) {
          return card;
        }

        const nextStatus: CardStatus = card.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE';
        return {
          ...card,
          status: nextStatus,
        };
      });
    },
    resetBufferState() {
      return initialState;
    },
  },
});

export const {
  replaceBufferState,
  updateProfileIdentity,
  setDraftSettings,
  commitDraftSettings,
  updateSavingSettings,
  toggleBalanceVisibility,
  toggleCardDetailsVisibility,
  toggleCardStatus,
  resetBufferState,
} = bufferSlice.actions;
export const bufferReducer = bufferSlice.reducer;
