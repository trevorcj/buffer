import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

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
  const isIncomingBufferAction = transaction.icon === 'buffer_in';
  const isOutgoingBufferAction = transaction.icon === 'buffer_out';
  const isSpendAction = transaction.icon === 'buffer_spend';
  const isAddMoneyAction = transaction.icon === 'buffer_add_money';
  const isUtilityAction = transaction.icon === 'buffer_utility';
  const isBufferAction =
    isIncomingBufferAction ||
    isOutgoingBufferAction ||
    isSpendAction ||
    isAddMoneyAction ||
    isUtilityAction;
  const isIncomingAmount = transaction.icon === 'buffer_in' || transaction.icon === 'buffer_add_money';

  return (
    <Pressable disabled={!onPress} onPress={onPress} style={styles.row}>
      <View
        style={[
          styles.iconWrap,
          isBufferAction ? styles.bufferWrap : isSpotify ? styles.spotifyWrap : styles.shoppingWrap,
        ]}
      >
        {isBufferAction ? (
          isAddMoneyAction ? (
            <Feather color={colors.secondary} name="plus-circle" size={16} />
          ) : isSpendAction ? (
            <Feather color={colors.secondary} name="shopping-bag" size={16} />
          ) : isUtilityAction ? (
            <MaterialIcons color={colors.secondary} name="bolt" size={18} />
          ) : (
            <Feather
              color={colors.secondary}
              name={isIncomingBufferAction ? 'arrow-down-left' : 'arrow-up-right'}
              size={16}
            />
          )
        ) : isSpotify ? (
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
          {transaction.note ? (
            <AppText color={colors.gray} style={styles.note} weight="medium">
              {transaction.note}
            </AppText>
          ) : null}
        </View>
        <View style={styles.amountWrap}>
          <AppText
            color={isIncomingAmount ? colors.success : colors.danger}
            style={styles.amount}
            weight="semibold"
          >
            {isIncomingAmount ? '+' : '-'}
            {formatCurrency(transaction.amount)}
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
  bufferWrap: {
    backgroundColor: colors.primary,
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
  note: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 15,
    maxWidth: 220,
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
