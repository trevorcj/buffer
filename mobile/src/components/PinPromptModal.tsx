import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { AppText } from './AppText';
import { PinIllustration } from './PinIllustration';
import { PrimaryButton } from './PrimaryButton';
import { TextField } from './TextField';

interface PinPromptModalProps {
  visible: boolean;
  pin: string;
  error?: string | null;
  isSubmitting?: boolean;
  onChangePin: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function PinPromptModal({
  visible,
  pin,
  error,
  isSubmitting = false,
  onChangePin,
  onClose,
  onConfirm,
}: PinPromptModalProps) {
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
        <View style={styles.sheet}>
          <PinIllustration />
          <AppText style={styles.title} weight="bold">
            Enter transaction PIN
          </AppText>
          <AppText color={colors.gray} style={styles.copy} weight="medium">
            Confirm this transfer with your 4-digit PIN.
          </AppText>
          <TextField
            hasError={Boolean(error)}
            keyboardType="number-pad"
            maxLength={4}
            onChangeText={(value) => onChangePin(value.replace(/\D/g, ''))}
            placeholder="1234"
            secureTextEntry
            value={pin}
          />
          {error ? (
            <AppText color={colors.danger} style={styles.errorText} weight="medium">
              {error}
            </AppText>
          ) : null}
          <View style={styles.buttonRow}>
            <PrimaryButton label="Cancel" onPress={onClose} style={styles.button} variant="outline" />
            <PrimaryButton
              disabled={pin.length !== 4 || isSubmitting}
              label={isSubmitting ? 'Sending...' : 'Confirm'}
              onPress={onConfirm}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 18, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  sheet: {
    width: '100%',
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  title: {
    marginTop: spacing.xl,
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  copy: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorText: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
  },
});
