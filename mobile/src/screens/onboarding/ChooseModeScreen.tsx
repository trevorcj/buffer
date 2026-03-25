import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { ModeOptionCard } from '../../components/ModeOptionCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SetupStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setDraftSettings } from '../../store/slices/bufferSlice';
import { SavingMode, UserSettings } from '../../types/domain';
import { getModeDescription } from '../../utils/format';

const roundUpThresholds = [50, 100, 500];

type Props = NativeStackScreenProps<SetupStackParamList, 'ChooseMode'>;

export function ChooseModeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const draftSettings = useAppSelector((state) => state.buffer.draftSettings);
  const [mode, setMode] = useState<SavingMode>(draftSettings.savingMode);
  const [percentage, setPercentage] = useState(draftSettings.percentage);
  const [threshold, setThreshold] = useState(draftSettings.roundUpThreshold);

  const thresholdIndex = useMemo(
    () => Math.max(0, roundUpThresholds.findIndex((item) => item === threshold)),
    [threshold],
  );

  const configValue = mode === 'AGBA' ? percentage : threshold;
  const configureLabel = mode === 'AGBA' ? `${percentage}%` : `₦${threshold}`;
  const helperText = getModeDescription(mode, configValue);

  const handleContinue = () => {
    const nextSettings: UserSettings = {
      savingMode: mode,
      percentage,
      roundUpThreshold: threshold,
    };

    dispatch(setDraftSettings(nextSettings));
    navigation.navigate('Preview');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <AppText style={styles.title} weight="bold">
          Choose Mode
        </AppText>
        <AppText color={colors.gray} style={styles.subtitle} weight="medium">
          Choose how you want to automate your savings
        </AppText>

        <View style={styles.options}>
          <ModeOptionCard
            mode="YAKUBU"
            onPress={() => setMode('YAKUBU')}
            selected={mode === 'YAKUBU'}
            subtitle="Round up your spending automatically"
            title="Yakubu Mode"
          />
          <ModeOptionCard
            mode="AGBA"
            onPress={() => setMode('AGBA')}
            selected={mode === 'AGBA'}
            subtitle="Save a percentage on every spend"
            title="Agba Mode"
          />
        </View>

        <View style={styles.configBlock}>
          <AppText style={styles.sectionTitle} weight="bold">
            Configure Mode
          </AppText>
          <AppText color={colors.gray} style={styles.sectionSubtitle} weight="medium">
            {mode === 'AGBA'
              ? 'Set your preferred percentage threshold'
              : 'Set your preferred round up threshold'}
          </AppText>

          <View style={styles.sliderRow}>
            <Slider
              maximumTrackTintColor="#A6C5CC"
              minimumTrackTintColor={colors.secondary}
              minimumValue={mode === 'AGBA' ? 1 : 0}
              maximumValue={mode === 'AGBA' ? 5 : roundUpThresholds.length - 1}
              onValueChange={(value) => {
                if (mode === 'AGBA') {
                  setPercentage(Math.round(value));
                } else {
                  setThreshold(roundUpThresholds[Math.round(value)]);
                }
              }}
              step={1}
              style={styles.slider}
              thumbTintColor="#7FA7B1"
              value={mode === 'AGBA' ? percentage : thresholdIndex}
            />
            <AppText style={styles.valueLabel} weight="semibold">
              • {configureLabel}
            </AppText>
          </View>

          <AppText color={colors.gray} style={styles.helperText} weight="medium">
            {helperText}
          </AppText>
        </View>

        <PrimaryButton label="Continue" onPress={handleContinue} style={styles.button} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 72,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.md,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  options: {
    gap: spacing.sm,
    marginTop: 34,
  },
  configBlock: {
    marginTop: 42,
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
  button: {
    marginTop: 60,
  },
});
