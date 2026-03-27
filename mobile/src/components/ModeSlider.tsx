import { StyleSheet, View } from "react-native";
import Slider from "@react-native-community/slider";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { SavingMode } from "../types/domain";
import { AppText } from "./AppText";

interface ModeSliderProps {
  mode: SavingMode;
  value: number;
  onValueChange: (value: number) => void;
}

const agbaValues = [1, 2, 3, 4, 5];
const yakubuValues = [50, 100, 500];

export function ModeSlider({ mode, value, onValueChange }: ModeSliderProps) {
  const values = mode === "AGBA" ? agbaValues : yakubuValues;
  const currentIndex = values.indexOf(value);
  const sliderMinimum = 0;
  const sliderMaximum = values.length - 1;
  const displayValue = mode === "AGBA" ? `${value}%` : `₦${value.toLocaleString()}`;
  const minLabel = mode === "AGBA" ? `${values[0]}%` : `₦${values[0].toLocaleString()}`;
  const maxLabel = mode === "AGBA" ? `${values[values.length - 1]}%` : `₦${values[values.length - 1].toLocaleString()}`;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <AppText color={colors.gray} style={styles.caption} weight="medium">
          {mode === "AGBA" ? "Percentage" : "Round-up threshold"}
        </AppText>
        <View style={styles.valuePill}>
          <AppText style={styles.valueLabel} weight="semibold">
            {displayValue}
          </AppText>
        </View>
      </View>

      <Slider
        maximumTrackTintColor="#E6E7E2"
        minimumTrackTintColor={colors.secondary}
        minimumValue={sliderMinimum}
        maximumValue={sliderMaximum}
        onValueChange={(index) => {
        onValueChange(values[index]);
      }}
        step={1}
        style={styles.slider}
        thumbTintColor={colors.secondary}
        value={currentIndex >= 0 ? currentIndex : 0}
      />

      <View style={styles.labelsRow}>
        <AppText color={colors.gray} style={styles.rangeLabel} weight="medium">
          {minLabel}
        </AppText>
        <AppText color={colors.gray} style={styles.rangeLabel} weight="medium">
          {maxLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  slider: {
    height: 28,
    marginLeft: -4,
    marginRight: -4,
  },
  valuePill: {
    minWidth: 70,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF5F6",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  valueLabel: {
    fontSize: 14,
    lineHeight: 18,
    color: colors.secondary,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -2,
  },
  rangeLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
});
