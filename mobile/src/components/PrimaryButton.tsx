import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { radii } from '../theme/spacing';
import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  style?: ViewStyle;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <AppText
        style={styles.label}
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
});
