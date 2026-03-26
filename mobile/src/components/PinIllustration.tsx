import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';

export function PinIllustration() {
  return (
    <View style={styles.wrap}>
      <View style={styles.lockBadge}>
        <Feather color={colors.secondary} name="lock" size={24} />
      </View>
      <View style={styles.dotsRow}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  lockBadge: {
    height: 78,
    width: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.secondary,
    opacity: 0.9,
  },
});
