const fs = require('fs');
const PDFDocument = require('pdfkit');
const moment = require('moment');


const ukrMonths = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
var str = ''; // >>> afterwards change to "let" !

// Initial data object (prepared to use as JSON)
const data = {
  "codeEDRPOU": "36325800",
  "orgName": "ОСББ «Хотинська 49М»",
  "orderNum": "264",
  "firstName": "Тарас",
  "patronomic": "Григорович",
  "surname": "Шевченко",
  "flatNum": "147",
  "chiefAccounter": "Олена Петрівна Гонтар",
  "services": [
    {
      "name": "Квартплата",
      "shortName": "Кв.плата",
      "tarif": 55.32,
      "nastupPokaznik": 200,
      "poperedPokaznik": 160,
      "riznitsa": 40,
      "summa": 1200.96
    },
    {
      "name": "РЕМ",
      "shortName": "РЕМ",
      "tarif": 22.07,
      "nastupPokaznik": 34,
      "poperedPokaznik": 30,
      "riznitsa": 4,
      "summa": 41.23
    },
    {
      "name": "Вода",
      "shortName": "Вода",
      "tarif": 100.8,
      "nastupPokaznik": 5674,
      "poperedPokaznik": 5670,
      "riznitsa": 4,
      "summa": 55.82
    },
    {
      "name": "Сміття",
      "shortName": "Сміття",
      "tarif": 21.11,
      "nastupPokaznik": 100,
      "poperedPokaznik": 87,
      "riznitsa": 13,
      "summa": 12.35
    }
  ]
};


// Stream to pipe to the resulting PDF
const upload = fs.createWriteStream('test.pdf');

// PDF document
const doc = new PDFDocument({
  size: 'A5', // 148 × 210 === 420 × 595 - 72 per inch, 28,35 p/cm
  layout: 'landscape',
  margins: {
    top: 30,
    bottom: 20,
    left: 20,
    right: 20,
  },
  info: {
    Title: 'Invoice',
    Author: 'osbb',
  },
});
doc.pipe(upload);



function createInvoicePDF(doc, data) {
  // Check the input data
  const codeEDRPOU = data.codeEDRPOU || '00000000';
  const orgName = data.orgName || 'ОСББ 1';
  const orderNum = data.orderNum || '000';
  const firstName = data.firstName || 'Прiзвище';
  const patronomic = data.patronomic || 'Ім\'я';
  const surname = data.surname || 'По-батьковi';
  const flatNum = data.flatNum || '000';
  const chiefAccounter = data.chiefAccounter || 'Головний бухгалтер';
  const services = data.services || [];
  if (services.length === 0 ) {
    services[0] =
      { name: '', shortName: '', nastupPokaznik: 0, poperedPokaznik: 0, riznitsa: 0, summa: 0 };
  }
  const servicesNum = services.length;
  for (var k = 0; k < servicesNum; k++) {
    if (!services[k].name) services[k].name = '?';
    if (!services[k].shortName) services[k].shortName = '?';
    if (!services[k].tarif) services[k].tarif = 0;
    if (!services[k].nastupPokaznik) services[k].nastupPokaznik = 0;
    if (!services[k].poperedPokaznik) services[k].poperedPokaznik = 0;
    if (!services[k].riznitsa) services[k].riznitsa = 0;
    if (!services[k].summa || !parseFloat(services[k].summa)) services[k].summa = 0;
  }

  // The invoice date
  moment.locale('uk');
  const curDate = moment().format('LL');
  const invoiceDate = `від « ${curDate.slice(0, 2)} » ${curDate.slice(3)}`;

  // Total sum
  var totalSum = 0.0;

  // Auxiliary text buffer
  var str = '';

  // Fonts registration. Letters for convenience: є і ї ґ Є І Ї Ґ
  doc.registerFont('regular', 'fonts/NotoSans-Regular.ttf');
  doc.registerFont('italic', 'fonts/NotoSans-Italic.ttf');
  doc.registerFont('bold', 'fonts/NotoSans-Bold.ttf');
  doc.registerFont('bold-italic', 'fonts/NotoSans-BoldItalic.ttf');

  // Vertical lines and "Лінія відрізу"
  doc.dash(3, { space: 4 });
  doc.moveTo(340, 30).lineTo(340, 400).stroke();
  doc.moveTo(352, 30).lineTo(352, 400).stroke();
  doc.undash();

  doc.font('regular').fontSize(8);
  const textOptions12 = { width: 12, align: 'center' };
  const linia = ['Л', 'і', 'н', 'і', 'я'];
  const liniaX = 340;
  const liniaInitY = 70;
  const liniaStepY = 15;
  for (var k = 0, len = linia.length; k < len; k++) {
    doc.text(linia[k], liniaX, liniaInitY + (k * liniaStepY), textOptions12);
  }
  const vidriz = ['в', 'і', 'д', 'р', 'і', 'з', 'у'];
  const vidrizInitY = 190;
  for (var k = 0, len = vidriz.length; k < len; k++) {
    doc.text(vidriz[k], liniaX, vidrizInitY + (k * liniaStepY), textOptions12);
  }

  //
  // >>>>> Left-hand pane <<<<<
  //
  // Section "Ідентифікаційний код ЄДРПОУ"
  doc.fontSize(8);
  str = 'Ідентифікаційний код ЄДРПОУ    ';
  doc.font('regular').text(str, 20, 35, { continued: true });
  doc.font('bold').text(codeEDRPOU);
  doc.lineWidth(1);
  doc.rect(145, 34, 60, 14).stroke();

  // Section "найменування підприємства"
  doc.moveDown(1);
  doc.font('bold-italic').fontSize(9);
  doc.text(` ${orgName} `, { width: 320, align: 'center' });
  doc.moveTo(20, 69).lineTo(320, 69).stroke();

  doc.moveDown(0.2);
  doc.font('regular').fontSize(7);
  str = '(найменування підприємства (установи, організації)';
  doc.text(str, { width: 320, align: 'center' });

  // Section "ПРИБУТКОВИЙ КАСОВИЙ ОРДЕР"
  doc.moveDown(2.5);
  doc.font('bold').fontSize(11);
  str = 'ПРИБУТКОВИЙ КАСОВИЙ ОРДЕР №      ';
  doc.text(str, { width: 320, align: 'center', continued: true });
  doc.text(`${orderNum}`, { underline: true });

  // Subsection "Дата"
  doc.font('regular').fontSize(8);
  doc.text(invoiceDate, { width: 320, align: 'center' });

  // Table 1
  doc.moveDown(1);
  doc.font('regular').fontSize(8);
  str = 'Кореспонду-\nючий рахунок,\nсубрахунок\nКод аналі-\nтичного\nобліку' +
    '\nСума\nцифрами\n\nКод цільового\nпризначення';
  doc.text(str, 23, 143, { width: 266, height: 35, align: 'center', columns: 4, columnGap: 0 });

  doc.lineWidth(2);
  doc.rect(20, 139, 310, 57).stroke();
  doc.lineWidth(1);
  doc.moveTo(87, 139).lineTo(87, 196).stroke();
  doc.moveTo(156, 139).lineTo(156, 196).stroke();
  doc.moveTo(218, 139).lineTo(218, 196).stroke();
  doc.moveTo(290, 139).lineTo(290, 196).stroke();
  doc.moveTo(20, 180).lineTo(330, 180).stroke();

  // Section "Прийнято від"
  doc.moveDown(4);
  doc.fontSize(9);
  str = 'Прийнято від  ';
  doc.font('bold').text(str, { width: 320, continued: true });
  str = `  ${firstName} ${patronomic} ${surname}  `;
  doc.font('regular').text(str, { underline: true, continued: true });
  str = ' кв. № ';
  doc.font('regular').text(str, { underline: false, continued: true });
  str = ` ${flatNum} `;
  doc.font('regular').text(str, { underline: true });

  // Section and Table "Підстава"
  doc.moveDown(0.1);
  doc.font('bold').fontSize(9);
  doc.text('Підстава');

  doc.lineWidth(1);
  const startY = 235;
  const stepY = 14;
  const tableHeight = 20 + servicesNum * stepY;
  doc.rect(20, startY, 310, tableHeight).stroke();
  const initY = 255;
  doc.moveTo(20, initY).lineTo(330, initY).stroke();
  for (var k = 0, currentY = 0; k < servicesNum; k++) {
    currentY = initY + (k + 1 ) * stepY;
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
  str = 'Наступний\nпоказник';
  doc.text(str, 81, startY, textOptions60);
  str = 'Попередній\nпоказник';
  doc.text(str, 141, startY, textOptions60);
  str = 'Різниця';
  doc.text(str, 198, startY + 2, textOptions60);
  str = 'Сума до сплати';
  doc.text(str, 257, startY + 2, textOptions76);

  doc.font('regular').fontSize(9);
  for (var k = 0, currentY = 0; k < servicesNum; k++) {
    currentY = initY + (k * stepY) + 1;
    doc.text(services[k].name, 23, currentY);
    doc.text(services[k].nastupPokaznik, 81, currentY, textOptions60);
    doc.text(services[k].poperedPokaznik, 141, currentY, textOptions60);
    doc.text(services[k].riznitsa, 198, currentY, textOptions60);
    doc.text(services[k].summa, 257, currentY, textOptions76);
    totalSum += parseFloat(services[k].summa);
  }

  // Section "Загальна сума"
  doc.fontSize(9);
  str = 'Загальна сума _______________________________________________________________';
  doc.font('bold').text(str, 20, initY + (servicesNum * stepY) + 10);
  doc.font('regular');
  str = '_______________________________________________________________грн.';
  doc.text(str, { continued: true });
  str = ` ${String(totalSum.toFixed(2).slice(-2))} `;
  doc.text(str, { underline: true, continued: true });
  str = ' коп.';
  doc.text(str, { underline: false });

  doc.moveDown(0.1);
  doc.fontSize(7);
  str = '(словами)';
  doc.font('regular').text(str, { width: 250, align: 'center' });

  // Section "Головний бухгалтер"
  doc.moveDown(1.5);
  doc.fontSize(9);
  str = 'Головний бухгалтер  ';
  doc.font('bold').text(str, { width: 320, continued: true });
  str = `     ${chiefAccounter}     `;
  doc.font('regular').text(str, { underline: true });

  //
  // >>>>> Right-hand pane <<<<<
  //
  doc.font('bold').fontSize(7);
  str = 'типова форма № КО-1';
  doc.text(str, 495, 35);

  // Section "найменування підприємства"
  doc.moveDown(1);
  doc.font('bold-italic').fontSize(9);
  str = ` ${orgName} `;
  doc.text(str, 370, 49, { width: 210, align: 'center' });
  doc.moveTo(370, 60).lineTo(570, 60).stroke();

  doc.font('regular').fontSize(6);
  str = '(найменування підприємства (установи, організації)';
  doc.text(str, 370, 60, { width: 210, align: 'center' });

  // Section "КВИТАНЦІЯ"
  doc.font('bold').fontSize(11);
  str = 'КВИТАНЦІЯ';
  doc.text(str, 357, 80, { width: 223, align: 'center' });
  doc.font('bold').fontSize(9);
  str = 'до прибуткового касового ордеру №     ';
  doc.text(str, { width: 223, align: 'center', continued: true });
  doc.text(`${orderNum}`, { underline: true });

  // Subsection "Дата"
  doc.font('regular').fontSize(8);
  doc.text(invoiceDate, { width: 223, align: 'center' });

  // Section "Прийнято від"
  doc.moveDown(1);
  doc.fontSize(9);
  str = 'Прийнято від ';
  doc.font('bold').text(str, { width: 225, continued: true });
  str = ` ${firstName.slice(0, 1)}.${patronomic.slice(0, 1)}. ${surname} `;
  doc.font('regular').text(str, { underline: true, continued: true });
  str = ' кв. № ';
  doc.font('regular').text(str, { underline: false, continued: true });
  str = `${flatNum}`;
  doc.font('regular').text(str, { underline: true });

  // Section and Table "Підстава"
  doc.moveDown(0.1);
  doc.font('bold').fontSize(9);
  doc.text('Підстава');

  doc.lineWidth(1);
  const startYR = 155;
  const stepYR = 14;
  const tableHeightR = 20 + (servicesNum * stepYR) + stepYR;
  doc.rect(357, startYR, 223, tableHeightR).stroke();
  const initYR = 175;
  doc.moveTo(357, initYR).lineTo(580, initYR).stroke();
  for (var k = 0, currentY = 0; k < servicesNum; k++) {
    currentY = initYR + (k + 1 ) * stepYR;
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
  str = 'Тариф';
  doc.font('regular').text(str, 400, startYR + 5, textOptions35);
  str = 'Наст.\nпоказник';
  doc.font('regular').text(str, 436, startYR, textOptions35);
  str = 'Попер.\nпоказник';
  doc.font('regular').text(str, 472, startYR, textOptions35);
  str = 'Різниця';
  doc.font('regular').text(str, 508, startYR + 5, textOptions31);
  str = 'Сума до\nсплати ₴';
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
  doc.font('regular').text('Всього:', 500, totalY);
  doc.font('regular').text(String(totalSum.toFixed(2)), 537, totalY, textOptions43);

  // Section "Загальна сума"
  doc.moveDown(1.2);
  doc.fontSize(9);
  str = 'Загальна сума ______________________________________';
  doc.font('bold').text(str, 357, initYR + (servicesNum * stepYR) + 30);
  doc.moveDown(0.1);
  doc.font('regular').fontSize(7);
  str = '(словами)';
  doc.text(str, { width: 223, align: 'center' });
  doc.fontSize(9);
  str = '________________________________________грн.';
  doc.text(str, { continued: true });
  str = ` ${String(totalSum.toFixed(2).slice(-2))} `;
  doc.text(str, { underline: true, continued: true });
  str = ' коп.';
  doc.text(str, { underline: false });

  // Section "М.П."
  doc.moveDown(2);
  doc.fontSize(9);
  str = 'М.П.';
  doc.font('bold').text(str);

  // Section "Головний бухгалтер"
  doc.moveDown(2);
  doc.fontSize(9);
  str = 'Головний бухгалтер  ';
  doc.font('bold').text(str, { width: 320, continued: true });
  str = `   ${chiefAccounter}   `;
  doc.font('regular').text(str, { underline: true });
}


createInvoicePDF(doc, data);
doc.end();

