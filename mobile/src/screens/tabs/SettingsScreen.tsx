import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { ModeOptionCard } from '../../components/ModeOptionCard';
import { ModeSlider } from '../../components/ModeSlider';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { replaceBufferState, resetBufferState } from '../../store/slices/bufferSlice';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { SavingMode, UserSettings } from '../../types/domain';
import { getModeDescription } from '../../utils/format';
import { saveSettings } from '../../services/bufferApi';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const bufferState = useAppSelector((state) => state.buffer);
  const { profile, settings } = useAppSelector((state) => state.buffer);
  const [draftSettings, setDraftSettings] = useState(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  const updateDraftSettings = (nextMode: SavingMode, nextValue: number) => {
    setDraftSettings((currentSettings) => ({
      savingMode: nextMode,
      percentage: nextMode === 'AGBA' ? nextValue : currentSettings.percentage,
      roundUpThreshold: nextMode === 'YAKUBU' ? nextValue : currentSettings.roundUpThreshold,
    }));
  };

  const configureValue =
    draftSettings.savingMode === 'AGBA' ? draftSettings.percentage : draftSettings.roundUpThreshold;

  const hasChanges =
    draftSettings.savingMode !== settings.savingMode ||
    draftSettings.percentage !== settings.percentage ||
    draftSettings.roundUpThreshold !== settings.roundUpThreshold;

  const handleSaveChanges = async () => {
    if (!token || !hasChanges || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const nextState = await saveSettings(token, bufferState, draftSettings);
      dispatch(replaceBufferState(nextState));
      Alert.alert('Settings updated', 'Your Buffer mode has been updated.');
    } catch (error) {
      Alert.alert(
        'Unable to update settings',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
              onPress={() => updateDraftSettings('YAKUBU', draftSettings.roundUpThreshold)}
              selected={draftSettings.savingMode === 'YAKUBU'}
              subtitle="Round up your spending automatically"
              title="Yakubu Mode"
            />
            <ModeOptionCard
              mode="AGBA"
              onPress={() => updateDraftSettings('AGBA', draftSettings.percentage)}
              selected={draftSettings.savingMode === 'AGBA'}
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
            {draftSettings.savingMode === 'AGBA'
              ? 'Set your preferred percentage threshold'
              : 'Set your preferred round up threshold'}
          </AppText>

          <ModeSlider
            mode={draftSettings.savingMode}
            onValueChange={(value) => updateDraftSettings(draftSettings.savingMode, value)}
            value={
              draftSettings.savingMode === 'AGBA'
                ? draftSettings.percentage
                : draftSettings.roundUpThreshold
            }
          />

          <AppText color={colors.gray} style={styles.helperText} weight="medium">
            {getModeDescription(draftSettings.savingMode, configureValue)}
          </AppText>

          <PrimaryButton
            disabled={!hasChanges || isSubmitting}
            label={isSubmitting ? 'Saving...' : 'Save changes'}
            onPress={handleSaveChanges}
            style={styles.saveButton}
          />
        </View>

        <Pressable onPress={() => navigation.getParent()?.navigate('ChangeCardPin')} style={styles.linkRow}>
          <View>
            <AppText style={styles.linkTitle} weight="semibold">
              Change card PIN
            </AppText>
            <AppText color={colors.gray} style={styles.linkCopy} weight="medium">
              Update the 4-digit PIN you use to confirm transfers.
            </AppText>
          </View>
          <Feather color={colors.gray} name="chevron-right" size={18} />
        </Pressable>

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
  saveButton: {
    marginTop: spacing.xl,
  },
  linkRow: {
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  linkTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  linkCopy: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 260,
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
