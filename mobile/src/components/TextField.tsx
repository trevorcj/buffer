import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { fontFamilies } from '../theme/typography';

interface TextFieldProps extends TextInputProps {
  hasError?: boolean;
}

export function TextField({ hasError = false, style, ...rest }: TextFieldProps) {
  return (
    <View style={[styles.wrapper, hasError && styles.error]}>
      <TextInput
        placeholderTextColor="#C9C9C7"
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 42,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  input: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    color: colors.black,
    paddingVertical: 0,
  },
  error: {
    borderColor: colors.danger,
  },
});
