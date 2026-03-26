import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { PinIllustration } from '../../components/PinIllustration';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { SetupStackParamList } from '../../navigation/types';
import { useAppDispatch } from '../../store/hooks';
import { setTransactionPin } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type Props = NativeStackScreenProps<SetupStackParamList, 'PinSetup'>;

export function PinSetupScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const isDisabled = pin.length !== 4 || confirmPin.length !== 4;

  const handleContinue = () => {
    if (pin !== confirmPin) {
      Alert.alert('PIN mismatch', 'Both PIN fields need to match before you continue.');
      return;
    }

    dispatch(setTransactionPin(pin));
    navigation.navigate('ChooseMode');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather color={colors.black} name="chevron-left" size={22} />
        </Pressable>
        <AppText style={styles.title} weight="bold">
          Set PIN
        </AppText>
      </View>

      <View style={styles.content}>
        <PinIllustration />
        <AppText style={styles.heroTitle} weight="bold">
          Create your transaction PIN
        </AppText>
        <AppText color={colors.gray} style={styles.heroCopy} weight="medium">
          You will use this 4-digit PIN to confirm money sends in the app.
        </AppText>

        <View style={styles.form}>
          <AppText style={styles.label} weight="semibold">
            Create PIN
          </AppText>
          <TextField
            keyboardType="number-pad"
            maxLength={4}
            onChangeText={(value) => setPin(value.replace(/\D/g, ''))}
            placeholder="1234"
            secureTextEntry
            value={pin}
          />

          <AppText style={styles.label} weight="semibold">
            Confirm PIN
          </AppText>
          <TextField
            keyboardType="number-pad"
            maxLength={4}
            onChangeText={(value) => setConfirmPin(value.replace(/\D/g, ''))}
            placeholder="1234"
            secureTextEntry
            value={confirmPin}
          />
        </View>

        <PrimaryButton
          disabled={isDisabled}
          label="Continue"
          onPress={handleContinue}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.xl - 2,
    height: 34,
    width: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 42,
  },
  heroTitle: {
    marginTop: spacing.xl,
    fontSize: 24,
    lineHeight: 30,
    textAlign: 'center',
  },
  heroCopy: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  form: {
    marginTop: 40,
    gap: spacing.sm,
  },
  label: {
    marginTop: spacing.md,
    fontSize: 15,
    lineHeight: 20,
  },
  button: {
    marginTop: 42,
  },
});
