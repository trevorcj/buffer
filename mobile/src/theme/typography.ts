export const fontFamilies = {
  regular: 'Aeonik_Regular',
  medium: 'Aeonik_Medium',
  semibold: 'Aeonik_Bold',
  bold: 'Aeonik_Bold',
  extrabold: 'Aeonik_Black',
} as const;

export type FontWeightKey = keyof typeof fontFamilies;
