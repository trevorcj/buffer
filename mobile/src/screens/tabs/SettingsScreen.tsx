import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { ModeOptionCard } from '../../components/ModeOptionCard';
import { ModeSlider } from '../../components/ModeSlider';
import { TipIllustration } from '../../components/PlaceholderIllustrations';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { resetBufferState, updateSavingSettings } from '../../store/slices/bufferSlice';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { SavingMode, UserSettings } from '../../types/domain';
import { getModeDescription } from '../../utils/format';

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { profile, settings } = useAppSelector((state) => state.buffer);

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

  const handleSignOut = () => {
    Alert.alert('Sign out', 'You will return to the welcome screen.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          dispatch(resetBufferState());
          dispatch(logout());
        },
      },
    ]);
  };

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

          <ModeSlider
            mode={settings.savingMode}
            onValueChange={(value) => updateSettings(settings.savingMode, value)}
            value={settings.savingMode === 'AGBA' ? settings.percentage : settings.roundUpThreshold}
          />

          <AppText color={colors.gray} style={styles.helperText} weight="medium">
            {getModeDescription(settings.savingMode, configureValue)}
          </AppText>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <TipIllustration height={52} width={52} />
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

        <Pressable onPress={handleSignOut} style={styles.signOutButton}>
          <AppText color={colors.danger} style={styles.signOutText} weight="semibold">
            Sign Out
          </AppText>
        </Pressable>
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
  helperText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 18,
    maxWidth: 400,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
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
  signOutButton: {
    marginTop: 18,
    height: 48,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: '#F2D2D0',
    backgroundColor: '#FFF5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 15,
    lineHeight: 20,
  },
});
