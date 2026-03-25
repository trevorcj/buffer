import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { AppText } from './AppText';

export function StatusPill({ label }: { label: string }) {
  return (
    <View style={styles.container}>
      <Feather color={colors.success} name="check-circle" size={12} />
      <AppText color={colors.success} style={styles.label} weight="semibold">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.successTint,
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
  },
});
