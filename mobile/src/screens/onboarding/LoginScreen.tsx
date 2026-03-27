import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { GuestStackParamList } from '../../navigation/types';
import { inferOnboardingCompletion, loginUser } from '../../services/bufferApi';
import { useAppDispatch } from '../../store/hooks';
import { setSession } from '../../store/slices/authSlice';
import { replaceBufferState } from '../../store/slices/bufferSlice';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type Props = NativeStackScreenProps<GuestStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = !email.trim() || !password.trim() || isSubmitting;

  const handleLogin = async () => {
    setIsSubmitting(true);

    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      dispatch(replaceBufferState(response.state));
      dispatch(
        setSession({
          token: response.token,
          hasCompletedOnboarding: inferOnboardingCompletion(response.state),
          transactionPin: response.transactionPin,
        }),
      );
    } catch (error) {
      Alert.alert(
        'Unable to log in',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AppText style={styles.title} weight="bold">
            Login to your account
          </AppText>
          <View style={styles.form}>
            <TextField
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="johndoe@money.com"
              value={email}
            />
            <TextField
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              value={password}
            />
          </View>
          <PrimaryButton
            label={isSubmitting ? 'Logging in...' : 'Login'}
            onPress={handleLogin}
            style={styles.button}
            disabled={isDisabled}
            loading={isSubmitting}
          />
          <Pressable onPress={() => navigation.navigate('SignUp')} style={styles.switchLink}>
            <AppText color={colors.gray} style={styles.linkText} weight="medium">
              <AppText color={colors.gray} style={styles.underlined} weight="medium">
                Create an account
              </AppText>{' '}
              instead?
            </AppText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 72,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
    marginTop: 34,
  },
  button: {
    marginTop: spacing.xl,
  },
  switchLink: {
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
  },
  linkText: {
    fontSize: 14,
    lineHeight: 20,
  },
  underlined: {
    textDecorationLine: 'underline',
  },
});
