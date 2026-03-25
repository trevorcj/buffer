import type { ReactNode } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { BalanceAmount } from '../../components/BalanceAmount';
import { BufferCard } from '../../components/BufferCard';
import { CircleIconButton } from '../../components/CircleIconButton';
import { TransactionRow } from '../../components/TransactionRow';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleBalanceVisibility } from '../../store/slices/bufferSlice';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { showComingSoonAlert } from '../../utils/alerts';
import { formatCurrency } from '../../utils/format';

function ActionPill({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionPill}>
      {icon}
      <AppText style={styles.actionLabel} weight="semibold">
        {label}
      </AppText>
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const {
    profile,
    wallet,
    cards,
    transactions,
    isBalanceVisible,
    settings,
  } = useAppSelector((state) => state.buffer);

  const latestTransactions = useMemo(() => transactions.slice(0, 2), [transactions]);
  const bufferedLabel = useMemo(
    () => `You buffered ${formatCurrency(wallet.bufferedLast30Days, 0)} in the last 30 days`,
    [wallet.bufferedLast30Days],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <AppText style={styles.avatarLabel} weight="bold">
                  {profile.avatarLabel}
                </AppText>
              </View>
              <View>
                <AppText numberOfLines={1} style={styles.name} weight="bold">
                  {profile.name}
                </AppText>
                <AppText color={colors.gray} style={styles.greeting} weight="medium">
                  Great day to save innit? 😊
                </AppText>
              </View>
            </View>

            <CircleIconButton onPress={() => showComingSoonAlert('Notifications will appear here later.')}>
              <Feather color={colors.black} name="bell" size={18} />
            </CircleIconButton>
          </View>

          <View style={styles.balanceRow}>
            <BalanceAmount amount={formatCurrency(wallet.balance)} visible={isBalanceVisible} />
            <Pressable onPress={() => dispatch(toggleBalanceVisibility())} style={styles.eyeButton}>
              <Feather
                color={colors.gray}
                name={isBalanceVisible ? 'eye' : 'eye-off'}
                size={18}
              />
            </Pressable>
          </View>

          <View style={styles.bufferedBadge}>
            <AppText color={colors.success} style={styles.bufferedText} weight="semibold">
              ↗ {formatCurrency(wallet.bufferedLast30Days, 0)} buffered
            </AppText>
          </View>

          <View style={styles.actionRow}>
            <ActionPill
              icon={<MaterialCommunityIcons color={colors.black} name="bank-transfer-in" size={16} />}
              label="Deposit"
              onPress={() => showComingSoonAlert('Deposit flow will be connected when the API is ready.')}
            />
            <ActionPill
              icon={<MaterialCommunityIcons color={colors.black} name="bank-transfer-out" size={16} />}
              label="Withdraw"
              onPress={() =>
                wallet.cushionBalance > 0
                  ? showComingSoonAlert('Withdraw flow will be connected when the API is ready.')
                  : Alert.alert('Nothing to withdraw', 'Your cushion balance is currently zero.')
              }
            />
            <ActionPill
              icon={<Ionicons color={colors.black} name="wallet-outline" size={15} />}
              label="Pay Bills"
              onPress={() => showComingSoonAlert('Bill payments will be connected when the API is ready.')}
            />
          </View>
        </View>

        <View style={styles.panel}>
          <BufferCard
            bufferedLabel={bufferedLabel}
            cardNumber={cards[0]?.maskedPan ?? '4000 •••• •••• •••• 2503'}
            modeLabel={settings.savingMode}
            variant="preview"
          />

          <View style={styles.sectionHeader}>
            <AppText style={styles.sectionTitle} weight="bold">
              Latest Transactions
            </AppText>
            <Pressable onPress={() => navigation.navigate('TransactionsTab')}>
              <AppText color={colors.gray} style={styles.seeAllText} weight="semibold">
                See all
              </AppText>
            </Pressable>
          </View>

          {latestTransactions.length > 0 ? (
            <FlatList
              data={latestTransactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TransactionRow
                  onPress={() =>
                    navigation.getParent()?.navigate('TransactionDetail', {
                      transactionId: item.id,
                    })
                  }
                  transaction={item}
                />
              )}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <AppText style={styles.emptyStateTitle} weight="semibold">
                No transactions yet
              </AppText>
              <AppText color={colors.gray} style={styles.emptyStateCopy} weight="medium">
                Start spending with your Buffer card to see activity here.
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    marginRight: spacing.md,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.avatar,
  },
  avatarLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.secondary,
  },
  name: {
    fontSize: 14,
    lineHeight: 19,
  },
  greeting: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  eyeButton: {
    marginLeft: spacing.sm,
    paddingTop: 4,
  },
  bufferedBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.successTint,
  },
  bufferedText: {
    fontSize: 14,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: 22,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  actionLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  panel: {
    marginTop: spacing.xxl,
    paddingTop: 18,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.panel,
    minHeight: 430,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 34,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  seeAllText: {
    fontSize: 14,
    lineHeight: 18,
  },
  emptyState: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  emptyStateCopy: {
    marginTop: spacing.xs,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 240,
  },
});
