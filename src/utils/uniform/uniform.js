import {UniformSize, UniformType} from '../Enum';
const safetyShoes = require('../../assets/images/safety-shoes.webp');
const safetyHand = require('../../assets/images/safety-hand.jpg');
const workJaket = require('../../assets/images/safety-jaket.jpg');
const pantsSafety = require('../../assets/images/safety-pants.jpg');
const coverallsSafety = require('../../assets/images/safety-coveralls.jpg');
export const uniformProducts = [
  {
    id: '1',
    name: 'Áo Bảo Hộ Lao Động',
    type: UniformType.WORK_JACKET,
    sizes: [
      UniformSize.S,
      UniformSize.M,
      UniformSize.L,
      UniformSize.XL,
      UniformSize.XXL,
    ],
    image: workJaket,
  },
  {
    id: '2',
    name: 'Quần Bảo Hộ Lao Động',
    type: UniformType.WORK_PANTS,
    sizes: [
      UniformSize.S,
      UniformSize.M,
      UniformSize.L,
      UniformSize.XL,
      UniformSize.XXL,
    ],
    image: pantsSafety,
  },
  {
    id: '3',
    name: 'Áo Liền Quần Bảo Hộ',
    type: UniformType.COVERALLS,
    sizes: [UniformSize.M, UniformSize.L, UniformSize.XL],
    image: coverallsSafety,
  },
  {
    id: '4',
    name: 'Găng Tay Bảo Hộ',
    type: UniformType.WORK_GLOVES,
    sizes: [UniformSize.S, UniformSize.M, UniformSize.L],
    image: safetyHand,
  },
  {
    id: '5',
    name: 'Giày Bảo Hộ Lao Động',
    type: UniformType.SAFETY_SHOES,
    sizes: [UniformSize.SIZE_39, UniformSize.SIZE_40, UniformSize.SIZE_41],
    image: safetyShoes,
  },
];
