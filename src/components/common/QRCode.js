import React from 'react';
import Svg, {Rect, Path} from 'react-native-svg';
import qrcode from 'qrcode-generator';

const QRCode = ({
  value,
  size = 68,
  color = '#111827',
  backgroundColor = '#ffffff',
}) => {
  const qr = qrcode(0, 'M');
  qr.addData(value || ' ');
  qr.make();
  const count = qr.getModuleCount();
  const cell = size / count;
  let path = '';
  for (let r = 0; r < count; r++) {
    let needDraw = false;
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        if (!needDraw) {
          path += `M${cell * c} ${cell / 2 + cell * r} `;
          needDraw = true;
        }
        if (needDraw && c === count - 1) {
          path += `L${cell * (c + 1)} ${cell / 2 + cell * r} `;
        }
      } else {
        if (needDraw) {
          path += `L${cell * c} ${cell / 2 + cell * r} `;
          needDraw = false;
        }
      }
    }
  }
  return (
    <Svg width={size} height={size}>
      <Rect width={size} height={size} fill={backgroundColor} />
      <Path
        d={path}
        stroke={color}
        strokeWidth={cell}
        fill="none"
        strokeLinecap="butt"
      />
    </Svg>
  );
};

export default QRCode;
