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
  'DK05RR_1',
  'DK05RR_2',
  'DF93_4',
  'DF93_3',
  'D66_5',
  'D66_6',
  'D042',
  'DK05FR_1',
  'DK05FR_2',
  'D61F',
  'D67CTC',
  'C84N',
  'D14KRR',
  'D14KFR',
  'C089',
];

export const products = productNames.map(productName => ({
  id: productName,
  name: productName,
}));
