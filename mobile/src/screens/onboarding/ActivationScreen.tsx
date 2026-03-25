import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '../../components/AppText';
import { BufferCard } from '../../components/BufferCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SetupStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { completeOnboarding } from '../../store/slices/authSlice';
import { commitDraftSettings } from '../../store/slices/bufferSlice';

type Props = NativeStackScreenProps<SetupStackParamList, 'Activation'>;

export function ActivationScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const draftSettings = useAppSelector((state) => state.buffer.draftSettings);
  const card = useAppSelector((state) => state.buffer.cards[0]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather color={colors.black} name="chevron-left" size={22} />
        </Pressable>
        <AppText style={styles.title} weight="bold">
          Activation
        </AppText>
      </View>

      <View style={styles.content}>
        <AppText style={styles.readyTitle} weight="bold">
          Your Buffer is ready 🎉
        </AppText>
        <View style={styles.captionPill}>
          <AppText color={colors.gray} style={styles.captionText} weight="medium">
            Start spending to start saving
          </AppText>
        </View>
        <View style={styles.cardWrap}>
          <BufferCard
            cardNumber={card.fullPan}
            modeLabel={draftSettings.savingMode}
            variant="full"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label="Start spending"
          onPress={() => {
            dispatch(commitDraftSettings());
            dispatch(completeOnboarding());
          }}
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
    paddingHorizontal: spacing.xl,
    paddingTop: 38,
    alignItems: 'center',
  },
  readyTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  captionPill: {
    marginTop: spacing.sm,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
  },
  captionText: {
    fontSize: 14,
    lineHeight: 18,
  },
  cardWrap: {
    width: '100%',
    marginTop: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
});
