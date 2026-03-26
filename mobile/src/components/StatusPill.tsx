import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { TransactionStatus } from '../types/domain';
import { AppText } from './AppText';

export function StatusPill({
  label,
  status = 'SUCCESS',
}: {
  label: string;
  status?: TransactionStatus;
}) {
  const isFailed = status === 'FAILED';
  const isPending = status === 'PENDING';
  const iconName = isFailed ? 'x-circle' : isPending ? 'clock' : 'check-circle';
  const tintColor = isFailed ? colors.danger : isPending ? colors.gray : colors.success;
  const backgroundColor = isFailed ? '#FFF0EF' : isPending ? '#F3F4F6' : colors.successTint;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Feather color={tintColor} name={iconName} size={12} />
      <AppText color={tintColor} style={styles.label} weight="semibold">
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
