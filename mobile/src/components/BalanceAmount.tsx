import { StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';
import { AppText } from './AppText';

interface BalanceAmountProps {
  amount: string;
  visible: boolean;
}

export function BalanceAmount({ amount, visible }: BalanceAmountProps) {
  return (
    <View style={styles.container}>
      <AppText
        adjustsFontSizeToFit
        numberOfLines={1}
        style={styles.amount}
        weight="extrabold"
      >
        {visible ? amount : '₦••••••••'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 1,
  },
  amount: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1.3,
    color: colors.black,
  },
});
