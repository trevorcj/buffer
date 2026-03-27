import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/spacing';
import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        isInactive && styles.disabled,
        pressed && !isInactive && styles.pressed,
        style,
      ]}
    >
      <AppText
        style={[styles.label, isInactive && styles.disabledLabel]}
        weight="semibold"
        color={variant === 'secondary' ? colors.white : colors.black}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: '#8E9E98',
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: {
    backgroundColor: '#F1F1EE',
  },
  pressed: {
    opacity: 0.92,
  },
  label: {
    fontSize: 16,
    lineHeight: 20,
  },
  disabledLabel: {
    color: '#4C5C57',
  },
});
