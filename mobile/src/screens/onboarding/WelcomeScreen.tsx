import { StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "../../components/PrimaryButton";
import { AppText } from "../../components/AppText";
import { GuestStackParamList } from "../../navigation/types";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

type Props = NativeStackScreenProps<GuestStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.footer}>
          <AppText color={colors.white} style={styles.title} weight="bold">
            Buffer turns everyday spending into a cushion you can rely on
          </AppText>
          <PrimaryButton
            label="Create Account"
            onPress={() => navigation.navigate("SignUp")}
            style={styles.button}
          />
          <PrimaryButton
            label="Login to your account"
            onPress={() => navigation.navigate("Login")}
            style={styles.button}
            variant="secondary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 18,
    paddingBottom: spacing.xxxl,
    justifyContent: "flex-end",
  },
  footer: {
    gap: 14,
  },
  title: {
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.8,
    maxWidth: 320,
    paddingBottom: spacing.lg,
  },
  button: {
    marginTop: 0,
  },
});
