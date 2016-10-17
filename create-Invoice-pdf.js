const fs = require('fs');
const moment = require('moment');
const num2str = require('./convert-num-to-words.js');
const _i = require('i18next');
const i18nBackend = require('i18next-sync-fs-backend');


// Preload fonts data into Buffers
var regularBuf = null;
// var italicBuf = null; // this font isn't used now. It's reserved for possible use in the future
var boldBuf = null;
var boldItalicBuf = null;
try {
  regularBuf = fs.readFileSync('fonts/NotoSans-Regular.ttf');
  // italicBuf = fs.readFileSync('fonts/NotoSans-Italic.ttf');
  boldBuf = fs.readFileSync('fonts/NotoSans-Bold.ttf');
  boldItalicBuf = fs.readFileSync('fonts/NotoSans-BoldItalic.ttf');
} catch (e) {
  console.log('createInvoicePDF error: Cannot read font file');
}


// 'i18next' initialization and locale loading
_i.use(i18nBackend)
  .init({
    // debug: true,
    lng: 'uk',
    fallbackLng: 'uk',
    initImmediate: false, // this is a key setting for the 'i18next-sync-fs-backend' correct work
    backend: { loadPath: './locales/{{lng}}/{{ns}}.json' },
  },
  (err) => {
    if (err) console.log(`i18next error: ${err.message}`);
  });


var str = ''; // >>> afterwards change to "let" !

module.exports = function (doc, data) { // createInvoicePDF
  // Check the input data correctness
  const codeEDRPOU = data.codeEDRPOU || '00000000';
  const orgName = data.orgName || _i.t('orgName');
  const orderNum = data.orderNum || '000';
  const firstName = data.firstName || _i.t('firstName');
  const patronomic = data.patronomic || _i.t('patronomic');
  const surname = data.surname || _i.t('surname');
  const flatNum = data.flatNum || '000';
  const chiefAccounter = data.chiefAccounter || _i.t('chiefAccounter');
  const services = data.services || [];
  if (services.length === 0) {
    services[0] =
      { name: '', shortName: '', nastupPokaznik: 0, poperedPokaznik: 0, riznitsa: 0, summa: 0 };
  }
  const servicesNum = services.length;
  for (var k = 0; k < servicesNum; k++) {
    if (!services[k].name) services[k].name = '???';
    if (!services[k].shortName) services[k].shortName = '???';
    if (!services[k].tarif) services[k].tarif = 0;
    if (!services[k].nastupPokaznik) services[k].nastupPokaznik = 0;
    if (!services[k].poperedPokaznik) services[k].poperedPokaznik = 0;
    if (!services[k].riznitsa) services[k].riznitsa = 0;
    if (!services[k].summa || !parseFloat(services[k].summa)) services[k].summa = 0;
  }

  // Set the invoice date
  moment.locale('uk');
  const curDate = moment().format('LL');
  const invoiceDate = `${_i.t('vid')} ${_i.t('lapka-l')}${curDate.slice(0, 2)}${_i.t('lapka-r')}`
    + ` ${curDate.slice(3)}`;

  // A variable for the Total sum
  var totalSum = 0.00;
  // Auxiliary string that is used as a text buffer
  var str = '';

  // Fonts registration
  doc.registerFont('regular', regularBuf);
  // doc.registerFont('italic', italicBuf);
  doc.registerFont('bold', boldBuf);
  doc.registerFont('bold-italic', boldItalicBuf);
  // Previous version: Font registration without Buffers
    // doc.registerFont('regular', 'fonts/NotoSans-Regular.ttf');
    // doc.registerFont('italic', 'fonts/NotoSans-Italic.ttf');
    // doc.registerFont('bold', 'fonts/NotoSans-Bold.ttf');
    // doc.registerFont('bold-italic', 'fonts/NotoSans-BoldItalic.ttf');

  //
  // ===== Start drawing =====
  //
  // Vertical lines and "Linia vidrizu"
  doc.dash(3, { space: 4 });
  doc.moveTo(340, 30).lineTo(340, 400).stroke();
  doc.moveTo(352, 30).lineTo(352, 400).stroke();
  doc.undash();

  doc.font('regular').fontSize(8);
  const textOptions12 = { width: 12, align: 'center' };
  const linia = [_i.t('L'), _i.t('i'), _i.t('n'), _i.t('i'), _i.t('ya')];
  const liniaX = 340;
  const liniaInitY = 70;
  const liniaStepY = 15;
  for (var k = 0, len = linia.length; k < len; k++) {
    doc.text(linia[k], liniaX, liniaInitY + (k * liniaStepY), textOptions12);
  }
  const vidriz = [_i.t('v'), _i.t('i'), _i.t('d'), _i.t('r'), _i.t('i'), _i.t('z'), _i.t('u')];
  const vidrizInitY = 190;
  for (var k = 0, len = vidriz.length; k < len; k++) {
    doc.text(vidriz[k], liniaX, vidrizInitY + (k * liniaStepY), textOptions12);
  }

  //
  // >>>>> Left-hand pane <<<<<
  //
  // Section "Nomer EDRPOU"
  doc.fontSize(8);
  str = `${_i.t('codeEDRPOU')}    `;
  doc.font('regular').text(str, 20, 35, { continued: true });
  doc.font('bold').text(codeEDRPOU);
  doc.lineWidth(1);
  doc.rect(145, 34, 60, 13).stroke();

  // Section "organization name"
  doc.moveDown(1);
  doc.font('bold-italic').fontSize(9);
  doc.text(` ${orgName} `, { width: 320, align: 'center' });
  doc.moveTo(20, 69).lineTo(320, 69).stroke();

  doc.moveDown(0.2);
  doc.font('regular').fontSize(7);
  str = _i.t('orgName');
  doc.text(str, { width: 320, align: 'center' });

  // Section "KASOVII ORDER"
  doc.moveDown(2.5);
  doc.font('bold').fontSize(11);
  str = `${_i.t('kasOrder')}      `;
  doc.text(str, { width: 320, align: 'center', continued: true });
  doc.text(`${orderNum}`, { underline: true });

  // Subsection "Date"
  doc.font('regular').fontSize(8);
  doc.text(invoiceDate, { width: 320, align: 'center' });

  // Table 1
  doc.moveDown(1);
  doc.font('regular').fontSize(8);
  str = _i.t('table1Header');
  doc.text(str, 23, 143, { width: 266, height: 35, align: 'center', columns: 4, columnGap: 0 });

  doc.lineWidth(2);
  doc.rect(20, 139, 310, 57).stroke();
  doc.lineWidth(1);
  doc.moveTo(87, 139).lineTo(87, 196).stroke();
  doc.moveTo(156, 139).lineTo(156, 196).stroke();
  doc.moveTo(218, 139).lineTo(218, 196).stroke();
  doc.moveTo(290, 139).lineTo(290, 196).stroke();
  doc.moveTo(20, 180).lineTo(330, 180).stroke();

  // Section "Prinyato vid"
  doc.moveDown(4);
  doc.fontSize(9);
  str = `${_i.t('prinyato')}  `;
  doc.font('bold').text(str, { width: 320, continued: true });
  str = `  ${firstName} ${patronomic} ${surname}  `;
  doc.font('regular').text(str, { underline: true, continued: true });
  str = ` ${_i.t('kv-N')} `;
  doc.font('regular').text(str, { underline: false, continued: true });
  str = ` ${flatNum} `;
  doc.font('regular').text(str, { underline: true });

  // Section and Table "Pidstava"
  doc.moveDown(0.1);
  doc.font('bold').fontSize(9);
  doc.text(_i.t('pidstava'));

  doc.lineWidth(1);
  const startY = 235;
  const stepY = 14;
  const tableHeight = 20 + servicesNum * stepY;
  doc.rect(20, startY, 310, tableHeight).stroke();
  const initY = 255;
  doc.moveTo(20, initY).lineTo(330, initY).stroke();
  for (var k = 0, currentY = 0; k < servicesNum; k++) {
    currentY = initY + (k + 1) * stepY;
    doc.moveTo(20, currentY).lineTo(330, currentY).stroke();
  }

  const endY = startY + tableHeight;
  doc.moveTo(80, startY).lineTo(80, endY).stroke();
  doc.moveTo(140, startY).lineTo(140, endY).stroke();
  doc.moveTo(200, startY).lineTo(200, endY).stroke();
  doc.moveTo(260, startY).lineTo(260, endY).stroke();

  doc.font('regular').fontSize(7);
  const textOptions60 = { width: 60, align: 'center' };
  const textOptions76 = { width: 76, align: 'center' };
  str = _i.t('nastupPokaznik');
  doc.text(str, 81, startY, textOptions60);
  str = _i.t('poperedPokaznik');
  doc.text(str, 141, startY, textOptions60);
  str = _i.t('riznitsa');
  doc.text(str, 200, startY + 2, textOptions60);
  str = _i.t('summa');
  doc.text(str, 257, startY + 2, textOptions76);

  doc.font('regular').fontSize(9);
  for (var k = 0, currentY = 0; k < servicesNum; k++) {
    currentY = initY + (k * stepY) + 1;
    doc.text(services[k].name, 23, currentY);
    doc.text(services[k].nastupPokaznik, 81, currentY, textOptions60);
    doc.text(services[k].poperedPokaznik, 141, currentY, textOptions60);
    doc.text(services[k].riznitsa, 200, currentY, textOptions60);
    doc.text(services[k].summa, 257, currentY, textOptions76);
    totalSum += parseFloat(services[k].summa);
  }

  // Section "Zagalna suma"
  doc.font('bold').fontSize(9);
  str = `${_i.t('zagalnaSuma')} `;
  doc.text(str, 20, initY + (servicesNum * stepY) + 10, { continued: true });
  doc.font('regular');
  const summaInWords = num2str(totalSum);
  str = `${summaInWords}`;
  doc.text(str, { underline: true, continued: true });
  str = ` ${_i.t('grn')} `;
  doc.text(str, { underline: false, continued: true });
  str = `${String(totalSum.toFixed(2).slice(-2))}`;
  doc.text(str, { underline: true, continued: true });
  str = ` ${_i.t('kop')}`;
  doc.text(str, { underline: false });
/*
  doc.moveDown(0.1);
  doc.fontSize(7);
  str = _i.t('slovami');
  doc.font('regular').text(str, { width: 250, align: 'center' });
*/

  // Section "Golovnii Buhgalter"
  doc.moveDown(1.5);
  doc.fontSize(9);
  str = `${_i.t('chiefAccounter')}  `;
  doc.font('bold').text(str, { width: 320, continued: true });
  str = ` ${chiefAccounter} `;
  doc.font('regular').text(str, { underline: true });

  //
  // >>>>> Right-hand pane <<<<<
  //
  doc.font('bold').fontSize(7);
  str = _i.t('forma-KO-1');
  doc.text(str, 495, 35);

  // Section "organization name"
  doc.moveDown(1);
  doc.font('bold-italic').fontSize(9);
  str = ` ${orgName} `;
  doc.text(str, 370, 49, { width: 210, align: 'center' });
  doc.moveTo(370, 60).lineTo(570, 60).stroke();

  doc.font('regular').fontSize(6);
  str = _i.t('orgName');
  doc.text(str, 370, 60, { width: 210, align: 'center' });

  // Section "KVITANTSIA"
  doc.font('bold').fontSize(11);
  str = _i.t('kvitantsia');
  doc.text(str, 357, 80, { width: 223, align: 'center' });
  doc.font('bold').fontSize(9);
  str = `${_i.t('doOrderu')}     `;
  doc.text(str, { width: 223, align: 'center', continued: true });
  doc.text(`${orderNum}`, { underline: true });

  // Subsection "Date"
  doc.font('regular').fontSize(8);
  doc.text(invoiceDate, { width: 223, align: 'center' });

  // Section "Prinyato vid"
  doc.moveDown(1);
  doc.fontSize(9);
  str = `${_i.t('prinyato')} `;
  doc.font('bold').text(str, { width: 225, continued: true });
  str = ` ${firstName.slice(0, 1)}.${patronomic.slice(0, 1)}. ${surname} `;
  doc.font('regular').text(str, { underline: true, continued: true });
  str = ` ${_i.t('kv-N')} `;
  doc.font('regular').text(str, { underline: false, continued: true });
  str = `${flatNum}`;
  doc.font('regular').text(str, { underline: true });

  // Section and Table "Pidstava"
  doc.moveDown(0.1);
  doc.font('bold').fontSize(9);
  doc.text(_i.t('pidstava'));

  doc.lineWidth(1);
  const startYR = 155;
  const stepYR = 14;
  const tableHeightR = 20 + (servicesNum * stepYR) + stepYR;
  doc.rect(357, startYR, 223, tableHeightR).stroke();
  const initYR = 175;
  doc.moveTo(357, initYR).lineTo(580, initYR).stroke();
  for (var k = 0, currentY = 0; k < servicesNum; k++) {
    currentY = initYR + (k + 1) * stepYR;
    doc.moveTo(357, currentY).lineTo(580, currentY).stroke();
  }

  const endYR = startYR + tableHeightR - stepYR;
  doc.moveTo(400, startYR).lineTo(400, endYR).stroke();
  doc.moveTo(436, startYR).lineTo(436, endYR).stroke();
  doc.moveTo(472, startYR).lineTo(472, endYR).stroke();
  doc.moveTo(508, startYR).lineTo(508, endYR).stroke();
  doc.moveTo(537, startYR).lineTo(537, endYR + stepYR).stroke();

  doc.font('regular').fontSize(7);
  const textOptions35 = { width: 35, align: 'center' };
  const textOptions31 = { width: 31, align: 'center' };
  const textOptions43 = { width: 43, align: 'center' };
  str = _i.t('tarif');
  doc.font('regular').text(str, 400, startYR + 5, textOptions35);
  str = _i.t('nastupPokaznikR');
  doc.font('regular').text(str, 436, startYR, textOptions35);
  str = _i.t('poperedPokaznikR');
  doc.font('regular').text(str, 472, startYR, textOptions35);
  str = _i.t('riznitsa');
  doc.font('regular').text(str, 507, startYR + 5, textOptions31);
  str = _i.t('summaR');
  doc.font('regular').text(str, 537, startYR, textOptions43);

  doc.font('regular').fontSize(9);
  for (var k = 0, currentYR = 0; k < servicesNum; k++) {
    currentYR = initYR + (k * stepYR) + 1;
    doc.text(services[k].shortName, 359, currentYR);
    doc.text(services[k].tarif, 400, currentYR, textOptions35);
    doc.text(services[k].nastupPokaznik, 436, currentYR, textOptions35);
    doc.text(services[k].poperedPokaznik, 472, currentYR, textOptions35);
    doc.text(services[k].riznitsa, 508, currentYR, textOptions31);
    doc.text(services[k].summa, 537, currentYR, textOptions43);
  }
  const totalY = initYR + (servicesNum * stepYR) + 1;
  doc.font('regular').text(_i.t('vsego'), 500, totalY);
  doc.font('regular').text(String(totalSum.toFixed(2)), 537, totalY, textOptions43);

  // Section "Zagalna suma"
  doc.moveDown(1.2);
  doc.font('bold').fontSize(9);
  str = `${_i.t('zagalnaSuma')} `;
  doc.text(str, 357, initYR + (servicesNum * stepYR) + 30, { continued: true });
  doc.font('regular');
  str = `${summaInWords}`;
  doc.text(str, { underline: true, continued: true });
  str = ` ${_i.t('grn')} `;
  doc.text(str, { underline: false, continued: true });
  str = `${String(totalSum.toFixed(2).slice(-2))}`;
  doc.text(str, { underline: true, continued: true });
  str = ` ${_i.t('kop')}`;
  doc.text(str, { underline: false });
/*
  doc.moveDown(0.1);
  doc.fontSize(7);
  str = _i.t('slovami');
  doc.font('regular').text(str, { width: 180, align: 'center' });
*/

  // Section "M.P."
  doc.moveDown(2);
  doc.fontSize(9);
  str = _i.t('pechat');
  doc.font('bold').text(str);

  // Section "Golovnii Buhgalter"
/* // Left-aligned text
  doc.moveDown(2);
  doc.fontSize(9);
  str = `${_i.t('chiefAccounter')}  `;
  doc.font('bold').text(str, { width: 223, continued: true });
  str = ` ${chiefAccounter} `;
  doc.font('regular').text(str, { underline: true });
*/
  // Experimental center-aligned text
  doc.moveDown(2);
  doc.fontSize(9);
  str = `${_i.t('chiefAccounter')}  `;
  doc.font('bold').text(str);
  str = ` ${chiefAccounter} `;
  doc.font('regular').text(str, 357, initYR + (servicesNum * stepYR) + 116,
    { width: 223, indent: 99, underline: true, align: 'center' });
//  doc.font('regular').text(str, 357, initYR + (servicesNum * stepYR) + 152,
//    { width: 223, indent: 99, underline: true, align: 'center' });

}
