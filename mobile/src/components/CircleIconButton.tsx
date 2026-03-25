import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

export function CircleIconButton({
  children,
  onPress,
}: {
  children: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.circleButton}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circleButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
});
