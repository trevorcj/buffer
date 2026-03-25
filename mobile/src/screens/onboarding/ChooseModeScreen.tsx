import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../../components/AppText";
import { ModeOptionCard } from "../../components/ModeOptionCard";
import { PrimaryButton } from "../../components/PrimaryButton";
import { ModeSlider } from "../../components/ModeSlider";
import { SetupStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setDraftSettings } from "../../store/slices/bufferSlice";
import { SavingMode, UserSettings } from "../../types/domain";
import { getModeDescription } from "../../utils/format";

type Props = NativeStackScreenProps<SetupStackParamList, "ChooseMode">;

export function ChooseModeScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const draftSettings = useAppSelector((state) => state.buffer.draftSettings);
  const [mode, setMode] = useState<SavingMode>(draftSettings.savingMode);
  const [percentage, setPercentage] = useState(draftSettings.percentage);
  const [threshold, setThreshold] = useState(draftSettings.roundUpThreshold);

  const configValue = mode === "AGBA" ? percentage : threshold;

  const handleContinue = () => {
    const nextSettings: UserSettings = {
      savingMode: mode,
      percentage,
      roundUpThreshold: threshold,
    };

    dispatch(setDraftSettings(nextSettings));
    navigation.navigate("Preview");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <AppText style={styles.screenTitle} weight="bold">
          Choose Mode
        </AppText>
        <AppText
          color={colors.gray}
          style={styles.screenSubtitle}
          weight="medium">
          Choose how you want to automate your savings
        </AppText>

        <View style={styles.options}>
          <ModeOptionCard
            mode="YAKUBU"
            onPress={() => setMode("YAKUBU")}
            selected={mode === "YAKUBU"}
            subtitle="Round up your spending automatically"
            title="Yakubu Mode"
          />
          <ModeOptionCard
            mode="AGBA"
            onPress={() => setMode("AGBA")}
            selected={mode === "AGBA"}
            subtitle="Save a percentage on every spend"
            title="Agba Mode"
          />
        </View>

        <View style={styles.configBlock}>
          <AppText style={styles.sectionTitle} weight="bold">
            Configure Mode
          </AppText>
          <AppText
            color={colors.gray}
            style={styles.sectionSubtitle}
            weight="medium">
            {mode === "AGBA"
              ? "Set your preferred percentage threshold"
              : "Set your preferred round up threshold"}
          </AppText>

          <ModeSlider
            mode={mode}
            onValueChange={mode === "AGBA" ? setPercentage : setThreshold}
            value={mode === "AGBA" ? percentage : threshold}
          />

          <AppText
            color={colors.gray}
            style={styles.helperText}
            weight="medium">
            {getModeDescription(mode, configValue)}
          </AppText>
        </View>

        <PrimaryButton
          label="Continue"
          onPress={handleContinue}
          style={styles.button}
        />
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
    paddingTop: 18,
    paddingBottom: spacing.xxxl,
  },
  screenTitle: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
  },
  screenSubtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "left",
  },
  options: {
    gap: spacing.sm,
    marginTop: 30,
  },
  configBlock: {
    marginTop: 34,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 38,
    letterSpacing: -0.3,
    textAlign: "left",
  },
  sectionSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 20,
    textAlign: "left",
  },
  helperText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 18,
    maxWidth: 400,
    textAlign: "left",
  },
  button: {
    marginTop: 48,
  },
});
