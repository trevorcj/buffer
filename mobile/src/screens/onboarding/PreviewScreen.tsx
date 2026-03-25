import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { ModeBadge } from '../../components/PlaceholderIllustrations';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SetupStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAppSelector } from '../../store/hooks';
import { getModeSummary } from '../../utils/format';

type Props = NativeStackScreenProps<SetupStackParamList, 'Preview'>;

export function PreviewScreen({ navigation }: Props) {
  const draftSettings = useAppSelector((state) => state.buffer.draftSettings);
  const configValue =
    draftSettings.savingMode === 'AGBA'
      ? draftSettings.percentage
      : draftSettings.roundUpThreshold;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather color={colors.black} name="chevron-left" size={22} />
        </Pressable>
        <AppText style={styles.title} weight="bold">
          Preview
        </AppText>
      </View>

      <View style={styles.content}>
        <ModeBadge mode={draftSettings.savingMode} />
        <AppText style={styles.modeTitle} weight="bold">
          {draftSettings.savingMode === 'AGBA' ? 'Agba Mode' : 'Yakubu Mode'}
        </AppText>
        <View style={styles.summaryPill}>
          <AppText color={colors.success} style={styles.summaryText} weight="semibold">
            {getModeSummary(draftSettings.savingMode, configValue)}
          </AppText>
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={() => navigation.navigate('Activation')} />
      </View>
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
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.xl - 2,
    height: 34,
    width: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  modeTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  summaryPill: {
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.successTint,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
});
