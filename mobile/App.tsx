import 'react-native-gesture-handler';

import { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { PersistedState, createAppStore } from './src/store';
import { colors } from './src/theme/colors';
import { loadPersistedState, persistState } from './src/services/storage';
import { useAppSelector } from './src/store/hooks';

function StorePersistence() {
  const auth = useAppSelector((state) => state.auth);
  const buffer = useAppSelector((state) => state.buffer);

  useEffect(() => {
    persistState({ auth, buffer });
  }, [auth, buffer]);

  return null;
}

export default function App() {
  const [preloadedState, setPreloadedState] = useState<PersistedState | undefined>();
  const [isHydrated, setIsHydrated] = useState(false);
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const persistedState = await loadPersistedState();

      if (isMounted) {
        setPreloadedState(persistedState);
        setIsHydrated(true);
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const store = useMemo(() => {
    if (!isHydrated) {
      return null;
    }

    return createAppStore(preloadedState);
  }, [isHydrated, preloadedState]);

  if (!fontsLoaded || !store) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <View style={styles.loader}>
            <ActivityIndicator color={colors.secondary} size="small" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <StatusBar style="dark" />
          <StorePersistence />
          <AppNavigator />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
});
