import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { TextField } from '../../components/TextField';
import { SetupStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { radii, spacing } from '../../theme/spacing';
import { mockApi } from '../../services/mockApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateProfileIdentity } from '../../store/slices/bufferSlice';

type IdentityType = 'BVN' | 'NIN';
type Props = NativeStackScreenProps<SetupStackParamList, 'Identity'>;

export function IdentityVerificationScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.buffer.profile);
  const [identityType, setIdentityType] = useState<IdentityType>('BVN');
  const [identityValue, setIdentityValue] = useState(profile.bvn ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = !identityValue.trim() || isSubmitting;

  const handleContinue = async () => {
    setIsSubmitting(true);

    try {
      const response = await mockApi.verifyIdentity({
        type: identityType,
        value: identityValue.trim(),
      });

      dispatch(updateProfileIdentity(response));
      navigation.navigate('ChooseMode');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <AppText style={styles.title} weight="bold">
          Identity Verification
        </AppText>
        <View style={styles.segment}>
          <Pressable
            onPress={() => setIdentityType('BVN')}
            style={[styles.segmentOption, identityType === 'BVN' && styles.segmentOptionActive]}
          >
            <AppText style={styles.segmentLabel} weight="semibold">
              BVN (*565*20#)
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => setIdentityType('NIN')}
            style={[styles.segmentOption, identityType === 'NIN' && styles.segmentOptionActive]}
          >
            <AppText
              color={identityType === 'NIN' ? colors.black : colors.gray}
              style={styles.segmentLabel}
              weight="semibold"
            >
              NIN
            </AppText>
          </Pressable>
        </View>
        <TextField
          autoCapitalize="characters"
          onChangeText={setIdentityValue}
          placeholder={identityType}
          value={identityValue}
        />
        <AppText color={colors.gray} style={styles.caption} weight="medium">
          Has to match your name
        </AppText>
        <PrimaryButton
          label={isSubmitting ? 'Continuing...' : 'Continue'}
          onPress={handleContinue}
          style={styles.button}
          disabled={isDisabled}
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
    paddingTop: 72,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  segment: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 34,
    marginBottom: spacing.xl,
  },
  segmentOption: {
    flex: 1,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentOptionActive: {
    backgroundColor: '#F6F4EF',
    borderColor: '#F6F4EF',
  },
  segmentLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
  caption: {
    marginTop: spacing.md,
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    marginTop: spacing.xl,
  },
});
