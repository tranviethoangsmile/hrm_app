export const shiftArr = [
  {
    name: 'A',
    id: 'A',
  },
  {
    name: 'B',

    id: 'B',
  },
];

const productNames = [
  'C84_BUV',
  'D16E_COP',
  'D637F',
  'D93F_PAO_DC2',
  'D67E_PAO',
  'D61F_PAO_DC2',
  'D66_DC3',
  'DF93_4',
  'DF93_3',
  'D042F_PAO_DC3',
  'D14KFR',
  'DK05FR_1',
  'DK05FR_2',
  'C84N',
  'C089',
  'D860F_PAO_DC3',
  'D67E_CTC',
  'D66_5',
  'D66_6',
  'D93F_PAO_DC4',
  'D042F_PAO_DC4',
  'D14KRR',
  'DK05RR_1',
  'DK05RR_2',
  'D61F_PAO_DC4',
];

export const products = productNames.map(productName => ({
  id: productName,
  name: productName,
}));
