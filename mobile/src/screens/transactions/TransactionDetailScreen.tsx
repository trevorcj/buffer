import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { StatusPill } from '../../components/StatusPill';
import { AppStackParamList } from '../../navigation/types';
import { useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { formatCurrency } from '../../utils/format';

type Props = NativeStackScreenProps<AppStackParamList, 'TransactionDetail'>;

function DetailRow({
  label,
  value,
  canCopy = false,
}: {
  label: string;
  value: string;
  canCopy?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <AppText color={colors.gray} style={styles.detailLabel} weight="medium">
        {label}
      </AppText>
      <View style={styles.detailValueWrap}>
        <AppText style={styles.detailValue} weight="semibold">
          {value}
        </AppText>
        {canCopy ? (
          <Pressable
            onPress={async () => {
              await Clipboard.setStringAsync(value);
              Alert.alert('Copied', 'Transaction number copied to clipboard.');
            }}
          >
            <Feather color={colors.gray} name="copy" size={15} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function TransactionDetailScreen({ navigation, route }: Props) {
  const transaction = useAppSelector((state) =>
    state.buffer.transactions.find((item) => item.id === route.params.transactionId),
  );

  if (!transaction) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingState}>
          <AppText style={styles.missingTitle} weight="bold">
            Transaction not found
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const isSpotify = transaction.icon === 'spotify';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather color={colors.black} name="chevron-left" size={22} />
        </Pressable>
        <AppText style={styles.title} weight="bold">
          Transaction Details
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.iconWrap, isSpotify ? styles.spotifyWrap : styles.shoppingWrap]}>
            {isSpotify ? (
              <FontAwesome5 color="#1DB954" name="spotify" size={28} />
            ) : (
              <MaterialIcons color="#F4A63C" name="stars" size={28} />
            )}
          </View>
          <AppText style={styles.merchantTitle} weight="semibold">
            {transaction.merchantName}
          </AppText>
          <AppText style={styles.amount} weight="extrabold">
            {formatCurrency(transaction.amount)}
          </AppText>
          <StatusPill label="Successful" />
        </View>

        <View style={styles.divider} />

        <View>
          <AppText style={styles.sectionTitle} weight="bold">
            Transaction Details
          </AppText>
          <View style={styles.rows}>
            <DetailRow label="Status" value="Completed" />
            <DetailRow label="Amount" value={formatCurrency(transaction.amount)} />
            <DetailRow label="Saved" value={formatCurrency(transaction.savedAmount)} />
            <DetailRow label="Recipient" value={transaction.recipient} />
            <DetailRow label="Payment Method" value={transaction.paymentMethod} />
            <DetailRow label="Date" value={transaction.dateLabel} />
            <DetailRow label="Transaction No." value={transaction.reference} canCopy />
          </View>
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
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.lg - 2,
    height: 36,
    width: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: 34,
    paddingBottom: spacing.xxxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    height: 70,
    width: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F3F0',
  },
  spotifyWrap: {
    backgroundColor: '#E5F8EA',
  },
  shoppingWrap: {
    backgroundColor: '#FFF2E0',
  },
  merchantTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  amount: {
    fontSize: 33,
    lineHeight: 38,
    letterSpacing: -1.2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: 34,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  rows: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  detailValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    maxWidth: '62%',
  },
  detailValue: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
});
