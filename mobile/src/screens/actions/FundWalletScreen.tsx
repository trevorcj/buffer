import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { AppStackParamList } from '../../navigation/types';
import { fundWallet } from '../../services/bufferApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { replaceBufferState } from '../../store/slices/bufferSlice';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';

type Props = NativeStackScreenProps<AppStackParamList, 'FundWallet'>;

export function FundWalletScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const bufferState = useAppSelector((state) => state.buffer);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = Number(amount.replace(/,/g, ''));
  const isDisabled = !Number.isFinite(parsedAmount) || parsedAmount <= 0 || isSubmitting;

  const handleSubmit = async () => {
    if (!token || isDisabled) {
      return;
    }

    setIsSubmitting(true);

    try {
      const nextState = await fundWallet(token, bufferState, parsedAmount);
      dispatch(replaceBufferState(nextState));
      Alert.alert('Wallet funded', 'Your main wallet balance has been updated.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Unable to fund wallet', error instanceof Error ? error.message : 'Please try again.');
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
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather color={colors.black} name="chevron-left" size={22} />
          </Pressable>
          <AppText style={styles.title} weight="bold">
            Add Money
          </AppText>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.heroCard}>
            <AppText color={colors.gray} style={styles.heroLabel} weight="medium">
              Main balance top up
            </AppText>
            <AppText style={styles.heroTitle} weight="bold">
              Top up your main balance before you send money or spend with Buffer.
            </AppText>
          </View>

          <View style={styles.form}>
            <AppText style={styles.label} weight="semibold">
              Amount
            </AppText>
            <TextField
              keyboardType="numeric"
              onChangeText={setAmount}
              placeholder="5000"
              value={amount}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            disabled={isDisabled}
            label={isSubmitting ? 'Adding...' : 'Add Money'}
            onPress={handleSubmit}
          />
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  heroCard: {
    borderRadius: radii.lg,
    backgroundColor: colors.accent,
    padding: spacing.xl,
  },
  heroLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  heroTitle: {
    marginTop: spacing.sm,
    fontSize: 24,
    lineHeight: 30,
    maxWidth: 260,
  },
  form: {
    marginTop: spacing.xxxl,
  },
  label: {
    marginBottom: spacing.sm,
    fontSize: 15,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
});
