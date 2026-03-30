const QRCodeStyling = require('qr-code-styling');
const fs = require('fs');

const qr = new QRCodeStyling({
  width: 1000, height: 1000, data: 'test', type: 'svg'
});
qr.getRawData('svg').then(buffer => {
  fs.writeFileSync('test_qr.svg', buffer);
  console.log('SVG written');
});
