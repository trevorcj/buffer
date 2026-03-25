import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { BufferCard } from '../../components/BufferCard';
import { CircleIconButton } from '../../components/CircleIconButton';
import { InsightsIllustration } from '../../components/PlaceholderIllustrations';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleCardDetailsVisibility } from '../../store/slices/bufferSlice';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { showComingSoonAlert } from '../../utils/alerts';
import { formatCurrency } from '../../utils/format';

function InfoRow({
  label,
  value,
  canCopy = true,
}: {
  label: string;
  value: string;
  canCopy?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <AppText color={colors.gray} style={styles.infoLabel} weight="medium">
        {label}
      </AppText>
      <View style={styles.infoValueWrap}>
        <AppText style={styles.infoValue} weight="semibold">
          {value}
        </AppText>
        {canCopy ? (
          <Pressable
            onPress={async () => {
              await Clipboard.setStringAsync(value);
              Alert.alert('Copied', `${label} copied to clipboard.`);
            }}
            style={styles.copyButton}
          >
            <Feather color={colors.gray} name="copy" size={15} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function CardScreen() {
  const dispatch = useAppDispatch();
  const { cards, settings, wallet, isCardDetailsVisible } = useAppSelector((state) => state.buffer);
  const card = cards[0] ?? {
    id: 'placeholder-card',
    maskedPan: '4000 •••• •••• 2503',
    fullPan: '4000 0000 0000 2503',
    accountName: 'BUFFER USER',
    expiryDate: '03/50',
    cvv: '111',
    status: 'ACTIVE' as const,
  };

  const fullPan = isCardDetailsVisible ? card.fullPan : '4000 •••• •••• 2503';
  const accountName = isCardDetailsVisible
    ? card.accountName
    : `${card.accountName.slice(0, Math.min(5, card.accountName.length))}••••••`;
  const cvv = isCardDetailsVisible ? card.cvv : '•••';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <AppText style={styles.title} weight="bold">
            Your Buffer Card
          </AppText>
          <CircleIconButton onPress={() => dispatch(toggleCardDetailsVisibility())}>
            <Feather
              color={colors.black}
              name={isCardDetailsVisible ? 'eye' : 'eye-off'}
              size={18}
            />
          </CircleIconButton>
        </View>

        <BufferCard cardNumber={fullPan} modeLabel={settings.savingMode} variant="full" />

        <View style={styles.infoCard}>
          <AppText style={styles.infoTitle} weight="bold">
            Account Information
          </AppText>
          <InfoRow label="Card Number" value={fullPan} />
          <InfoRow label="Account Name" value={accountName} />
          <InfoRow label="Expiry Date" value={card.expiryDate} />
          <InfoRow label="CVV" value={cvv} />
        </View>

        <View style={styles.lowerPanel}>
          <View style={styles.amountBlock}>
            <AppText color={colors.gray} style={styles.amountLabel} weight="bold">
              BUFFER AMOUNT
            </AppText>
            <AppText
              adjustsFontSizeToFit
              numberOfLines={1}
              style={styles.amountValue}
              weight="extrabold"
            >
              {formatCurrency(wallet.cushionBalance)}
            </AppText>
          </View>

          <View style={styles.buttonRow}>
            <PrimaryButton
              label="Cash out"
              onPress={() => showComingSoonAlert('Cash out flow will be connected when the API is ready.')}
              style={styles.rowButton}
              variant="outline"
            />
            <PrimaryButton
              label="Pay Bills"
              onPress={() => showComingSoonAlert('Bill payment flow will be connected when the API is ready.')}
              style={styles.rowButton}
              variant="outline"
            />
          </View>

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <InsightsIllustration height={50} width={50} />
            </View>
            <View style={styles.insightCopy}>
              <AppText color={colors.gray} style={styles.insightLabel} weight="bold">
                INSIGHTS
              </AppText>
              <AppText style={styles.insightTitle} weight="bold">
                This card has helped you save {formatCurrency(wallet.bufferedLast30Days, 0)} in 30 days
              </AppText>
            </View>
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  infoCard: {
    marginTop: 18,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  infoTitle: {
    fontSize: 17,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
  infoValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: spacing.lg,
    flexShrink: 1,
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'right',
    flexShrink: 1,
  },
  copyButton: {
    padding: 2,
  },
  lowerPanel: {
    marginTop: spacing.xl,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.md,
    backgroundColor: colors.accent,
  },
  amountBlock: {
    marginTop: 0,
  },
  amountLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  amountValue: {
    marginTop: spacing.sm,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1.2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  rowButton: {
    flex: 1,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    borderRadius: radii.md,
    backgroundColor: '#F4F4F1',
    padding: spacing.lg,
  },
  insightIcon: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  insightCopy: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 10,
    lineHeight: 14,
  },
  insightTitle: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 21,
  },
});
