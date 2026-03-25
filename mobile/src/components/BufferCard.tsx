import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { AppText } from './AppText';

interface BufferCardProps {
  variant: 'preview' | 'full';
  modeLabel: string;
  cardNumber: string;
  bufferedLabel?: string;
}

export function BufferCard({
  variant,
  modeLabel,
  cardNumber,
  bufferedLabel = 'You buffered ₦2,090 in the last 30 days',
}: BufferCardProps) {
  if (variant === 'preview') {
    return (
      <View style={styles.previewStack}>
        <View style={[styles.previewLayer, styles.previewLayerBack]} />
        <View style={[styles.previewLayer, styles.previewLayerMiddle]} />
        <View style={styles.previewCard}>
          <View style={styles.bufferedBanner}>
            <AppText color={colors.tealText} style={styles.bufferedBannerText} weight="semibold">
              {bufferedLabel}
            </AppText>
          </View>
          <AppText style={styles.visaPreview} weight="extrabold">
            VISA
          </AppText>
          <View style={styles.previewInfo}>
            <AppText color={colors.gray} style={styles.previewLabel} weight="medium">
              Card Number
            </AppText>
            <AppText style={styles.previewNumber} weight="medium">
              {cardNumber}
            </AppText>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fullCard}>
      <AppText color={colors.secondary} style={styles.visaFull} weight="extrabold">
        VISA
      </AppText>
      <View style={styles.modeChip}>
        <AppText color={colors.secondary} style={styles.modeChipLabel} weight="bold">
          {modeLabel}
        </AppText>
      </View>
      <View style={styles.outlineShapeOne} />
      <View style={styles.outlineShapeTwo} />
      <AppText color="#D0EF3F" style={styles.backgroundWord} weight="extrabold">
        Buffer
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  previewStack: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingBottom: 24,
  },
  previewLayer: {
    position: 'absolute',
    width: '86%',
    height: 146,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOpacity: 0.04,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 10,
    },
  },
  previewLayerBack: {
    bottom: 2,
    opacity: 0.35,
    transform: [{ scaleX: 0.9 }],
  },
  previewLayerMiddle: {
    bottom: 9,
    opacity: 0.55,
    transform: [{ scaleX: 0.95 }],
  },
  previewCard: {
    width: '90%',
    minHeight: 144,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 12,
    },
  },
  bufferedBanner: {
    position: 'absolute',
    top: -24,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    borderRadius: radii.md,
    backgroundColor: '#D9F6FF',
  },
  bufferedBannerText: {
    fontSize: 11,
    lineHeight: 14,
  },
  visaPreview: {
    fontSize: 22,
    lineHeight: 28,
  },
  previewInfo: {
    marginTop: 44,
    gap: 5,
  },
  previewLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
  previewNumber: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.25,
  },
  fullCard: {
    height: 177,
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  visaFull: {
    fontSize: 18,
    lineHeight: 22,
  },
  modeChip: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  modeChipLabel: {
    fontSize: 14,
    lineHeight: 16,
  },
  outlineShapeOne: {
    position: 'absolute',
    right: 16,
    top: 24,
    width: 72,
    height: 86,
    borderWidth: 1,
    borderColor: colors.cardOutline,
    transform: [{ skewY: '40deg' }],
  },
  outlineShapeTwo: {
    position: 'absolute',
    right: 42,
    top: 6,
    width: 56,
    height: 70,
    borderWidth: 1,
    borderColor: colors.cardOutline,
    transform: [{ skewY: '40deg' }],
  },
  backgroundWord: {
    position: 'absolute',
    left: 10,
    bottom: -2,
    fontSize: 78,
    lineHeight: 80,
    letterSpacing: -2.6,
  },
});
