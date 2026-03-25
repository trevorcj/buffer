import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import { colors } from '../theme/colors';

export function BufferOrbitIllustration() {
  return (
    <Svg height={112} width={112} viewBox="0 0 112 112">
      <Circle cx="56" cy="56" fill="none" r="34" stroke="#58C95E" strokeWidth="1.6" />
      <Circle cx="56" cy="56" fill="none" r="44" stroke="#58C95E" strokeOpacity="0.5" strokeWidth="1.6" />
      <Circle cx="56" cy="56" fill={colors.primary} r="22" />
      <Circle cx="56" cy="56" fill="#A5F14C" r="15" />
      <SvgText
        fill={colors.secondary}
        fontFamily="PlusJakartaSans_800ExtraBold"
        fontSize="22"
        textAnchor="middle"
        x="56"
        y="64"
      >
        ₦
      </SvgText>
      <Circle cx="23" cy="48" fill="#73D94F" r="7" />
      <Circle cx="81" cy="25" fill="#73D94F" r="7" />
      <Circle cx="85" cy="76" fill="#73D94F" r="7" />
      <Circle cx="29" cy="84" fill="#73D94F" r="7" />
      <Circle cx="61" cy="18" fill="#73D94F" r="4" />
      <Circle cx="18" cy="67" fill="#73D94F" r="4" />
      <Circle cx="88" cy="50" fill="#73D94F" r="4" />
      <Circle cx="59" cy="90" fill="#73D94F" r="4" />
    </Svg>
  );
}

export function ModeBadge({ mode }: { mode: 'AGBA' | 'YAKUBU' }) {
  if (mode === 'AGBA') {
    return (
      <Svg height={52} width={52} viewBox="0 0 52 52">
        <Circle cx="26" cy="26" fill="#F5F4EF" r="26" />
        <Path
          d="M10 27c5-8 12-13 20-15m-6 31c6-10 15-17 26-20M14 19c6 3 12 9 15 16m5-8c4 1 7 4 10 8"
          stroke="#5C7B63"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </Svg>
    );
  }

  return (
    <Svg height={52} width={52} viewBox="0 0 52 52">
      <Circle cx="26" cy="26" fill="#F5F4EF" r="26" />
      <Path
        d="M14 16c4 2 7 6 9 11m2 8c2-8 7-15 15-20M11 28c6-2 12-1 18 2m5 3c3-1 6-1 9 0"
        stroke="#5C7B63"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </Svg>
  );
}
