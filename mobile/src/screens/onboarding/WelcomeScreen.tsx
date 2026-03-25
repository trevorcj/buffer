import { StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BufferOrbitIllustration } from '../../components/PlaceholderIllustrations';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AppText } from '../../components/AppText';
import { GuestStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type Props = NativeStackScreenProps<GuestStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <BufferOrbitIllustration />
        </View>
        <View style={styles.footer}>
          <AppText color={colors.white} style={styles.title} weight="bold">
            Buffer turns everyday spending into a cushion you can rely on
          </AppText>
          <PrimaryButton
            label="Create Account"
            onPress={() => navigation.navigate('SignUp')}
            style={styles.button}
          />
          <PrimaryButton
            label="Login to your account"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
            variant="secondary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    gap: spacing.lg,
  },
  title: {
    fontSize: 24,
    lineHeight: 31,
    letterSpacing: -0.8,
    maxWidth: 320,
  },
  button: {
    marginTop: spacing.sm,
  },
});
