import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { SavingMode } from '../types/domain';
import { AppText } from './AppText';
import { AgbaIllustration, YakubuIllustration } from './PlaceholderIllustrations';

interface ModeOptionCardProps {
  mode: SavingMode;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}

export function ModeOptionCard({
  mode,
  title,
  subtitle,
  selected,
  onPress,
}: ModeOptionCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.selectedCard]}>
      <View style={styles.illustrationWrap}>
        {mode === 'AGBA' ? <AgbaIllustration height={44} width={50} /> : <YakubuIllustration height={44} width={50} />}
      </View>
      <View style={styles.content}>
        <AppText style={styles.title} weight="semibold">
          {title}
        </AppText>
        <AppText color={colors.gray} style={styles.subtitle} weight="medium">
          {subtitle}
        </AppText>
      </View>
      <View style={[styles.radio, selected && styles.selectedRadio]}>
        {selected ? <Feather color={colors.white} name="check" size={12} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 74,
    borderWidth: 1,
    borderColor: colors.overlay,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  illustrationWrap: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCard: {
    backgroundColor: colors.accent,
    borderColor: '#E6E4DD',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  radio: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E0E1DE',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  selectedRadio: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
});
