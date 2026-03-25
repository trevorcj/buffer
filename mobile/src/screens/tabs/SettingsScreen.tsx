import { ScrollView, StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { ModeOptionCard } from '../../components/ModeOptionCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateSavingSettings } from '../../store/slices/bufferSlice';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { SavingMode, UserSettings } from '../../types/domain';
import { getModeDescription } from '../../utils/format';

const roundUpThresholds = [50, 100, 500];

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { profile, settings } = useAppSelector((state) => state.buffer);
  const thresholdIndex = Math.max(
    0,
    roundUpThresholds.findIndex((item) => item === settings.roundUpThreshold),
  );

  const updateSettings = (nextMode: SavingMode, nextValue: number) => {
    const nextSettings: UserSettings = {
      savingMode: nextMode,
      percentage: nextMode === 'AGBA' ? nextValue : settings.percentage,
      roundUpThreshold: nextMode === 'YAKUBU' ? nextValue : settings.roundUpThreshold,
    };

    dispatch(updateSavingSettings(nextSettings));
  };

  const configureValue =
    settings.savingMode === 'AGBA' ? settings.percentage : settings.roundUpThreshold;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarLabel} weight="bold">
            {profile.avatarLabel}
          </AppText>
        </View>
        <AppText numberOfLines={2} style={styles.name} weight="bold">
          {profile.name}
        </AppText>

        <View style={styles.divider} />

        <View style={styles.section}>
          <AppText style={styles.sectionTitle} weight="bold">
            Buffer Mode
          </AppText>
          <AppText color={colors.gray} style={styles.sectionSubtitle} weight="medium">
            Choose how you want to automate your savings
          </AppText>

          <View style={styles.options}>
            <ModeOptionCard
              mode="YAKUBU"
              onPress={() => updateSettings('YAKUBU', settings.roundUpThreshold)}
              selected={settings.savingMode === 'YAKUBU'}
              subtitle="Round up your spending automatically"
              title="Yakubu Mode"
            />
            <ModeOptionCard
              mode="AGBA"
              onPress={() => updateSettings('AGBA', settings.percentage)}
              selected={settings.savingMode === 'AGBA'}
              subtitle="Save a percentage on every spend"
              title="Agba Mode"
            />
          </View>
        </View>

        <View style={styles.section}>
          <AppText style={styles.sectionTitle} weight="bold">
            Configure Mode
          </AppText>
          <AppText color={colors.gray} style={styles.sectionSubtitle} weight="medium">
            {settings.savingMode === 'AGBA'
              ? 'Set your preferred percentage threshold'
              : 'Set your preferred round up threshold'}
          </AppText>

          <View style={styles.sliderRow}>
            <Slider
              maximumTrackTintColor="#A6C5CC"
              minimumTrackTintColor={colors.secondary}
              minimumValue={settings.savingMode === 'AGBA' ? 1 : 0}
              maximumValue={
                settings.savingMode === 'AGBA' ? 5 : roundUpThresholds.length - 1
              }
              onValueChange={(value) => {
                if (settings.savingMode === 'AGBA') {
                  updateSettings('AGBA', Math.round(value));
                } else {
                  updateSettings('YAKUBU', roundUpThresholds[Math.round(value)]);
                }
              }}
              step={1}
              style={styles.slider}
              thumbTintColor="#7FA7B1"
              value={settings.savingMode === 'AGBA' ? settings.percentage : thresholdIndex}
            />
            <AppText style={styles.valueLabel} weight="semibold">
              • {settings.savingMode === 'AGBA' ? `${settings.percentage}%` : `₦${settings.roundUpThreshold}`}
            </AppText>
          </View>

          <AppText color={colors.gray} style={styles.helperText} weight="medium">
            {getModeDescription(settings.savingMode, configureValue)}
          </AppText>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <AppText style={styles.tipIconText} weight="bold">
              ₦
            </AppText>
          </View>
          <View style={styles.tipCopy}>
            <AppText color={colors.gray} style={styles.tipLabel} weight="bold">
              TIP
            </AppText>
            <AppText style={styles.tipTitle} weight="bold">
              Add ₦2,000 extra to keep Buffer active
            </AppText>
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
    paddingTop: 18,
    paddingBottom: spacing.xxxl,
  },
  avatar: {
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.avatar,
  },
  avatarLabel: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.secondary,
  },
  name: {
    marginTop: spacing.lg,
    fontSize: 20,
    lineHeight: 26,
    maxWidth: 210,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.xl,
  },
  section: {
    marginTop: 34,
  },
  sectionTitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  sectionSubtitle: {
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
  },
  options: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  slider: {
    flex: 1,
    height: 36,
    marginLeft: -14,
  },
  valueLabel: {
    fontSize: 15,
    lineHeight: 20,
  },
  helperText: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 18,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 46,
    borderRadius: radii.md,
    backgroundColor: '#F4F4F1',
    padding: spacing.lg,
  },
  tipIcon: {
    height: 52,
    width: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F7EC',
  },
  tipIconText: {
    fontSize: 20,
    lineHeight: 24,
    color: colors.success,
  },
  tipCopy: {
    flex: 1,
  },
  tipLabel: {
    fontSize: 10,
    lineHeight: 14,
  },
  tipTitle: {
    marginTop: 2,
    fontSize: 15,
    lineHeight: 21,
  },
});
