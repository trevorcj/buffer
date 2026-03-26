import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { PinIllustration } from '../../components/PinIllustration';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { AppStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setTransactionPin } from '../../store/slices/authSlice';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type Props = NativeStackScreenProps<AppStackParamList, 'ChangeCardPin'>;

export function ChangeCardPinScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const existingPin = useAppSelector((state) => state.auth.transactionPin);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const isDisabled =
    currentPin.length !== 4 || newPin.length !== 4 || confirmPin.length !== 4;

  const handleSave = () => {
    if (existingPin && currentPin !== existingPin) {
      Alert.alert('Incorrect PIN', 'Your current PIN does not match our records.');
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('PIN mismatch', 'Your new PIN entries need to match.');
      return;
    }

    dispatch(setTransactionPin(newPin));
    Alert.alert('PIN updated', 'Your card PIN has been changed successfully.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather color={colors.black} name="chevron-left" size={22} />
        </Pressable>
        <AppText style={styles.title} weight="bold">
          Change Card PIN
        </AppText>
      </View>

      <View style={styles.content}>
        <PinIllustration />
        <AppText style={styles.heroTitle} weight="bold">
          Update your 4-digit PIN
        </AppText>
        <AppText color={colors.gray} style={styles.heroCopy} weight="medium">
          Use a PIN you can remember easily but others cannot guess.
        </AppText>

        <View style={styles.form}>
          <AppText style={styles.label} weight="semibold">
            Current PIN
          </AppText>
          <TextField
            keyboardType="number-pad"
            maxLength={4}
            onChangeText={(value) => setCurrentPin(value.replace(/\D/g, ''))}
            placeholder="1234"
            secureTextEntry
            value={currentPin}
          />

          <AppText style={styles.label} weight="semibold">
            New PIN
          </AppText>
          <TextField
            keyboardType="number-pad"
            maxLength={4}
            onChangeText={(value) => setNewPin(value.replace(/\D/g, ''))}
            placeholder="5678"
            secureTextEntry
            value={newPin}
          />

          <AppText style={styles.label} weight="semibold">
            Confirm new PIN
          </AppText>
          <TextField
            keyboardType="number-pad"
            maxLength={4}
            onChangeText={(value) => setConfirmPin(value.replace(/\D/g, ''))}
            placeholder="5678"
            secureTextEntry
            value={confirmPin}
          />
        </View>

        <PrimaryButton
          disabled={isDisabled}
          label="Save new PIN"
          onPress={handleSave}
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
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.lg - 2,
    height: 36,
    width: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
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
