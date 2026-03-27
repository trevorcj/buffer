import { useWindowDimensions, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { AppText } from './AppText';
import BufferCardArt from '../../assets/buffer-card.svg';

interface BufferCardProps {
  variant: 'preview' | 'full';
  modeLabel: string;
  cardNumber: string;
  bufferedLabel?: string;
  previewLabel?: string;
}

export function BufferCard({
  variant,
  modeLabel,
  cardNumber,
  bufferedLabel = 'You buffered ₦2,090 in the last 30 days',
  previewLabel = 'Card Number',
}: BufferCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(280, Math.min(width - spacing.xl * 2, 361));
  const cardHeight = Math.round((cardWidth * 200) / 361);

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
              {previewLabel}
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
    <View style={[styles.fullCardWrap, { height: cardHeight, width: cardWidth }]}>
      <BufferCardArt
        height={cardHeight}
        style={styles.fullCardArt}
        width={cardWidth}
      />
      <View style={styles.modeChip}>
        <AppText color={colors.secondary} style={styles.modeChipLabel} weight="bold">
          {modeLabel}
        </AppText>
      </View>
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
  fullCardWrap: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: colors.primary,
    position: 'relative',
  },
  fullCardArt: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  modeChip: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(12, 70, 81, 0.08)',
  },
  modeChipLabel: {
    fontSize: 13,
    lineHeight: 16,
  },
  visaFull: {
    fontSize: 18,
    lineHeight: 22,
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
