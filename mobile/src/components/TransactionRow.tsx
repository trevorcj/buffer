import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';

import { BufferTransaction } from '../types/domain';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { formatCurrency } from '../utils/format';
import { AppText } from './AppText';

interface TransactionRowProps {
  transaction: BufferTransaction;
  onPress?: () => void;
}

function TransactionRowComponent({ transaction, onPress }: TransactionRowProps) {
  const isSpotify = transaction.icon === 'spotify';

  return (
    <Pressable disabled={!onPress} onPress={onPress} style={styles.row}>
      <View style={[styles.iconWrap, isSpotify ? styles.spotifyWrap : styles.shoppingWrap]}>
        {isSpotify ? (
          <FontAwesome5 color="#1DB954" name="spotify" size={16} />
        ) : (
          <MaterialIcons color="#F4A63C" name="stars" size={17} />
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.copy}>
          <AppText numberOfLines={1} style={styles.title} weight="semibold">
            {transaction.merchantName}
          </AppText>
          <AppText color={colors.gray} numberOfLines={1} style={styles.subtitle} weight="medium">
            {transaction.merchantSubtitle}
          </AppText>
        </View>
        <View style={styles.amountWrap}>
          <AppText color={colors.danger} style={styles.amount} weight="semibold">
            -{formatCurrency(transaction.amount)}
          </AppText>
          <AppText color={colors.success} style={styles.saved} weight="semibold">
            ↗ {formatCurrency(transaction.savedAmount)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

export const TransactionRow = memo(TransactionRowComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 14,
  },
  iconWrap: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shoppingWrap: {
    backgroundColor: '#FFF2E0',
  },
  spotifyWrap: {
    backgroundColor: '#E5F8EA',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copy: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: 14,
    lineHeight: 19,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  saved: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
  },
});
