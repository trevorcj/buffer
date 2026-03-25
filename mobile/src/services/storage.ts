import AsyncStorage from '@react-native-async-storage/async-storage';

import { PersistedState } from '../store';

const STORAGE_KEY = 'buffer-mobile-state';

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
