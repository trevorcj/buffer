import { StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather, Ionicons } from '@expo/vector-icons';

import { useAppSelector } from '../store/hooks';
import { colors } from '../theme/colors';
import { GuestStackParamList, SetupStackParamList, MainTabParamList, AppStackParamList } from './types';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SignUpScreen } from '../screens/onboarding/SignUpScreen';
import { LoginScreen } from '../screens/onboarding/LoginScreen';
import { IdentityVerificationScreen } from '../screens/onboarding/IdentityVerificationScreen';
import { PinSetupScreen } from '../screens/onboarding/PinSetupScreen';
import { ChooseModeScreen } from '../screens/onboarding/ChooseModeScreen';
import { PreviewScreen } from '../screens/onboarding/PreviewScreen';
import { ActivationScreen } from '../screens/onboarding/ActivationScreen';
import { HomeScreen } from '../screens/tabs/HomeScreen';
import { CardScreen } from '../screens/tabs/CardScreen';
import { TransactionHistoryScreen } from '../screens/tabs/TransactionHistoryScreen';
import { SettingsScreen } from '../screens/tabs/SettingsScreen';
import { TransactionDetailScreen } from '../screens/transactions/TransactionDetailScreen';
import { ChangeCardPinScreen } from '../screens/settings/ChangeCardPinScreen';
import { FundWalletScreen } from '../screens/actions/FundWalletScreen';
import { SendMoneyScreen } from '../screens/actions/SpendScreen';
import { WithdrawCushionScreen } from '../screens/actions/WithdrawCushionScreen';
import { PayBillScreen } from '../screens/actions/PayBillScreen';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.white,
  },
};

const GuestStack = createNativeStackNavigator<GuestStackParamList>();
const SetupStack = createNativeStackNavigator<SetupStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function iconForRoute(routeName: keyof MainTabParamList, focused: boolean) {
  const color = focused ? colors.secondary : colors.tabInactive;

  if (routeName === 'HomeTab') {
    return <Feather color={color} name="home" size={21} />;
  }

  if (routeName === 'CardTab') {
    return <Feather color={color} name="credit-card" size={21} />;
  }

  if (routeName === 'TransactionsTab') {
    return <Ionicons color={color} name="time-outline" size={23} />;
  }

  return <Feather color={color} name="user" size={21} />;
}

function MainTabs() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused }) => iconForRoute(route.name, focused),
      })}
    >
      <MainTab.Screen component={HomeScreen} name="HomeTab" />
      <MainTab.Screen component={CardScreen} name="CardTab" />
      <MainTab.Screen component={TransactionHistoryScreen} name="TransactionsTab" />
      <MainTab.Screen component={SettingsScreen} name="SettingsTab" />
    </MainTab.Navigator>
  );
}

function GuestNavigator() {
  return (
    <GuestStack.Navigator screenOptions={{ headerShown: false }}>
      <GuestStack.Screen component={WelcomeScreen} name="Welcome" />
      <GuestStack.Screen component={SignUpScreen} name="SignUp" />
      <GuestStack.Screen component={LoginScreen} name="Login" />
    </GuestStack.Navigator>
  );
}

function SetupNavigator() {
  return (
    <SetupStack.Navigator screenOptions={{ headerShown: false }}>
      <SetupStack.Screen component={IdentityVerificationScreen} name="Identity" />
      <SetupStack.Screen component={PinSetupScreen} name="PinSetup" />
      <SetupStack.Screen component={ChooseModeScreen} name="ChooseMode" />
      <SetupStack.Screen component={PreviewScreen} name="Preview" />
      <SetupStack.Screen component={ActivationScreen} name="Activation" />
    </SetupStack.Navigator>
  );
}

function AppShell() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen component={MainTabs} name="Tabs" />
      <AppStack.Screen component={TransactionDetailScreen} name="TransactionDetail" />
      <AppStack.Screen component={ChangeCardPinScreen} name="ChangeCardPin" />
      <AppStack.Screen component={FundWalletScreen} name="FundWallet" />
      <AppStack.Screen component={SendMoneyScreen} name="SendMoney" />
      <AppStack.Screen component={WithdrawCushionScreen} name="WithdrawCushion" />
      <AppStack.Screen component={PayBillScreen} name="PayBill" />
    </AppStack.Navigator>
  );
}

export function AppNavigator() {
  const token = useAppSelector((state) => state.auth.token);
  const hasCompletedOnboarding = useAppSelector((state) => state.auth.hasCompletedOnboarding);

  return (
    <NavigationContainer theme={navigationTheme}>
      {token ? (hasCompletedOnboarding ? <AppShell /> : <SetupNavigator />) : <GuestNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 78,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: colors.white,
  },
});
