import AsyncStorage from '@react-native-async-storage/async-storage';

import { DemoState } from './mockApi';
import { PersistedState } from '../store';

const STORAGE_KEY = 'buffer-mobile-state';
const ACCOUNT_STATE_KEY_PREFIX = 'buffer-mobile-account-state:';
const ACCOUNT_PIN_KEY_PREFIX = 'buffer-mobile-account-pin:';

function getAccountStateKey(email: string) {
  return `${ACCOUNT_STATE_KEY_PREFIX}${email.trim().toLowerCase()}`;
}

function getAccountPinKey(email: string) {
  return `${ACCOUNT_PIN_KEY_PREFIX}${email.trim().toLowerCase()}`;
}

export async function loadPersistedState() {
  try {
    const rawState = await AsyncStorage.getItem(STORAGE_KEY);

    if (!rawState) {
      return undefined;
    }

    return JSON.parse(rawState) as PersistedState;
  } catch {
    return undefined;
  }
}

export async function persistState(state: PersistedState) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence should never block the app.
  }
}

export async function loadAccountState(email: string) {
  try {
    const rawState = await AsyncStorage.getItem(getAccountStateKey(email));

    if (!rawState) {
      return undefined;
    }

    return JSON.parse(rawState) as DemoState;
  } catch {
    return undefined;
  }
}

export async function persistAccountState(email: string, state: DemoState) {
  try {
    await AsyncStorage.setItem(getAccountStateKey(email), JSON.stringify(state));
  } catch {
    // Persistence should never block the app.
  }
}

export async function loadAccountPin(email: string) {
  try {
    return await AsyncStorage.getItem(getAccountPinKey(email));
  } catch {
    return null;
  }
}

export async function persistAccountPin(email: string, pin: string) {
  try {
    await AsyncStorage.setItem(getAccountPinKey(email), pin);
  } catch {
    // Persistence should never block the app.
  }
}
