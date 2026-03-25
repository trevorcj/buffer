import { Text, TextProps, TextStyle } from 'react-native';

import { colors } from '../theme/colors';
import { fontFamilies, FontWeightKey } from '../theme/typography';

interface AppTextProps extends TextProps {
  weight?: FontWeightKey;
  color?: string;
}

export function AppText({
  weight = 'regular',
  color = colors.black,
  style,
  ...rest
}: AppTextProps) {
  const baseStyle: TextStyle = {
    fontFamily: fontFamilies[weight],
    color,
  };

  return <Text {...rest} style={[baseStyle, style]} />;
}
