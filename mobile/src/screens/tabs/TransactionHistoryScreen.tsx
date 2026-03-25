import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { CircleIconButton } from '../../components/CircleIconButton';
import { TransactionRow } from '../../components/TransactionRow';
import { useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { showComingSoonAlert } from '../../utils/alerts';

export function TransactionHistoryScreen() {
  const navigation = useNavigation<any>();
  const transactions = useAppSelector((state) => state.buffer.transactions);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <AppText style={styles.title} weight="bold">
          Transaction History
        </AppText>
        <CircleIconButton onPress={() => showComingSoonAlert('Export will be connected when the API is ready.')}>
          <Feather color={colors.black} name="download" size={18} />
        </CircleIconButton>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={transactions}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <AppText style={styles.emptyTitle} weight="bold">
              No transactions yet
            </AppText>
            <AppText color={colors.gray} style={styles.emptyCopy} weight="medium">
              Your Buffer history will appear here once spending starts.
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.getParent()?.navigate('TransactionDetail', {
                transactionId: item.id,
              })
            }
          >
            <TransactionRow transaction={item} />
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 120,
  },
  emptyTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  emptyCopy: {
    marginTop: spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 240,
  },
});
