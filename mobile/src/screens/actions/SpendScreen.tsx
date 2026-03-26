import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { PinPromptModal } from '../../components/PinPromptModal';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { AppStackParamList } from '../../navigation/types';
import { getSpendPreview, simulatePayment, TransactionActionError } from '../../services/bufferApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { replaceBufferState } from '../../store/slices/bufferSlice';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'SendMoney'>;

export function SendMoneyScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const transactionPin = useAppSelector((state) => state.auth.transactionPin);
  const bufferState = useAppSelector((state) => state.buffer);
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);

  const parsedAmount = Number(amount.replace(/,/g, ''));
  const spendPreview =
    Number.isFinite(parsedAmount) && parsedAmount > 0
      ? getSpendPreview(parsedAmount, bufferState.settings, bufferState.wallet.balance)
      : null;
  const isDisabled =
    !Number.isFinite(parsedAmount) ||
    parsedAmount <= 0 ||
    !recipientName.trim() ||
    isSubmitting;

  const closePinModal = () => {
    setPin('');
    setPinError(null);
    setIsPinModalVisible(false);
  };

  const handleOpenPin = () => {
    if (!transactionPin) {
      Alert.alert(
        'PIN required',
        'Finish setting your transaction PIN before you send money.',
      );
      return;
    }

    setPin('');
    setPinError(null);
    setIsPinModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!token || isDisabled) {
      return;
    }

    if (pin.length !== 4 || pin !== transactionPin) {
      setPinError('Enter the correct 4-digit transaction PIN.');
      return;
    }

    setIsSubmitting(true);
    setPinError(null);

    try {
      const nextState = await simulatePayment(token, bufferState, {
        amount: parsedAmount,
        merchantName: recipientName.trim(),
      });
      dispatch(replaceBufferState(nextState));
      closePinModal();
      Alert.alert('Money sent', 'Your transfer has been completed successfully.');
      navigation.goBack();
    } catch (error) {
      if (error instanceof TransactionActionError) {
        dispatch(replaceBufferState(error.nextState));
      }

      Alert.alert('Unable to send money', error instanceof Error ? error.message : 'Please try again.');
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
            Send Money
          </AppText>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.heroCard}>
            <AppText color={colors.gray} style={styles.heroLabel} weight="medium">
              Main balance available
            </AppText>
            <AppText style={styles.heroTitle} weight="bold">
              {formatCurrency(bufferState.wallet.balance)}
            </AppText>
            <AppText color={colors.gray} style={styles.heroCopy} weight="medium">
              Send from your main balance. Buffer will save automatically based on your selected mode.
            </AppText>
          </View>

          <View style={styles.form}>
            <AppText style={styles.label} weight="semibold">
              Recipient name
            </AppText>
            <TextField
              autoCapitalize="words"
              onChangeText={setRecipientName}
              placeholder="Amina Yusuf"
              value={recipientName}
            />

            <AppText style={styles.label} weight="semibold">
              Amount
            </AppText>
            <TextField
              keyboardType="numeric"
              onChangeText={setAmount}
              placeholder="5000"
              value={amount}
            />
            {spendPreview ? (
              <View style={styles.previewCard}>
                <AppText color={colors.gray} style={styles.previewLabel} weight="medium">
                  Buffer on this transfer
                </AppText>
                <AppText style={styles.previewValue} weight="bold">
                  {formatCurrency(spendPreview.savedAmount)}
                </AppText>
                <AppText color={colors.gray} style={styles.previewCopy} weight="medium">
                  Total leaving main balance: {formatCurrency(spendPreview.totalDebit)}
                </AppText>
                {spendPreview.isExactThresholdMatch ? (
                  <AppText color={colors.gray} style={styles.previewHint} weight="medium">
                    This amount already lands exactly on your Yakubu threshold, so no extra buffer is added.
                  </AppText>
                ) : null}
                {spendPreview.isBufferSkippedDueToInsufficientFunds ? (
                  <AppText color={colors.gray} style={styles.previewHint} weight="medium">
                    Buffer will be skipped so the transfer can still go through with your available balance.
                  </AppText>
                ) : null}
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            disabled={isDisabled}
            label="Send"
            onPress={handleOpenPin}
          />
        </View>
      </KeyboardAvoidingView>
      <PinPromptModal
        error={pinError}
        isSubmitting={isSubmitting}
        onChangePin={setPin}
        onClose={closePinModal}
        onConfirm={handleSubmit}
        pin={pin}
        visible={isPinModalVisible}
      />
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
    fontSize: 28,
    lineHeight: 34,
  },
  heroCopy: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 300,
  },
  form: {
    marginTop: spacing.xxxl,
    gap: spacing.sm,
  },
  previewCard: {
    marginTop: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    padding: spacing.lg,
  },
  previewLabel: {
    fontSize: 13,
    lineHeight: 18,
  },
  previewValue: {
    marginTop: spacing.xs,
    fontSize: 22,
    lineHeight: 28,
  },
  previewCopy: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
  },
  previewHint: {
    marginTop: spacing.sm,
    fontSize: 12,
    lineHeight: 17,
  },
  label: {
    marginTop: spacing.md,
    fontSize: 15,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
});
