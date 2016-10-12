const fs = require('fs');
const PDFDocument = require('pdfkit');

const ukrMonths = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];

var str =''; // >>> afterwards change to "let" !


// Stream to pipe to the resulting PDF
const upload = fs.createWriteStream('test.pdf');

// PDF document
const doc = new PDFDocument({
  size: 'A5', // 148 × 210 === 420 × 595 - 72 per inch, 28,35 p/cm
  layout: 'landscape',
  margins: {
    top: 40,
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

// Fonts registration. Letters for convenience: є і ї ґ Є І Ї Ґ
doc.registerFont('regular', 'fonts/NotoSans-Regular.ttf');
doc.registerFont('italic', 'fonts/NotoSans-Italic.ttf');
doc.registerFont('bold', 'fonts/NotoSans-Bold.ttf');
doc.registerFont('bold-italic', 'fonts/NotoSans-BoldItalic.ttf');

// Initial data object
const data = {
  codeEDRPOU: '36325800',
  orgName: 'ОСББ «Хотинська 49М»',
  orderNum: '264',
  invoiceDate: new Date(),
  firstName: 'Тарас',
  patronomic: 'Григорович',
  surname: 'Шевченко',
  flatNum: '147',
  chiefAccounter: 'Олена Петрівна Гонтарь',
};

// ======= INVOICE TEMPLATE =======
// Vertical lines and "Лінія відрізу"
doc.dash(3, { space: 4 });
doc.moveTo(340, 35).lineTo(340, 400).stroke();
doc.moveTo(352, 35).lineTo(352, 400).stroke();
doc.undash();

doc.fontSize(8);
doc.font('regular');
doc.text(`Л`, 340, 70,  { width: 12, align: 'center' });
doc.text(`і`, 340, 85,  { width: 12, align: 'center' });
doc.text(`н`, 340, 100, { width: 12, align: 'center' });
doc.text(`і`, 340, 115, { width: 12, align: 'center' });
doc.text(`я`, 340, 130, { width: 12, align: 'center' });
doc.text(`в`, 340, 190, { width: 12, align: 'center' });
doc.text(`і`, 340, 205, { width: 12, align: 'center' });
doc.text(`д`, 340, 220, { width: 12, align: 'center' });
doc.text(`р`, 340, 235, { width: 12, align: 'center' });
doc.text(`і`, 340, 250, { width: 12, align: 'center' });
doc.text(`з`, 340, 265, { width: 12, align: 'center' });
doc.text(`у`, 340, 280, { width: 12, align: 'center' });

// >>> Left pane
// Section "Ідентифікаційний код ЄДРПОУ"
doc.fontSize(8);
str = `Ідентифікаційний код ЄДРПОУ    `;
doc.font('regular').text(str, 20, 40, { continued: true });
doc.font('bold').text(data.codeEDRPOU);
doc.lineWidth(1);
doc.rect(145, 39, 60, 14).stroke();

// Section "найменування підприємства"
doc.moveDown(1);
doc.fontSize(9);
doc.font('bold-italic').text(` ${data.orgName} `, { width: 320, align: 'center' });
doc.moveTo(20, 74).lineTo(320, 74).stroke();

doc.moveDown(0.2);
doc.fontSize(7);
str = '(найменування підприємства (установи, організації)';
doc.font('regular').text(str, { width: 320, align: 'center' });

// Section "ПРИБУТКОВИЙ КАСОВИЙ ОРДЕР"
doc.moveDown(2.5);
doc.fontSize(11);
str = 'ПРИБУТКОВИЙ КАСОВИЙ ОРДЕР №      ';
doc.font('bold').text(str, { width: 320, align: 'center', continued: true });
doc.font('bold').text(`  ${data.orderNum}  `, { underline: true });

// Subsection "Дата"
doc.fontSize(8);
str = `від « ${data.invoiceDate.getDate()} »  ${ukrMonths[data.invoiceDate.getMonth()]} ` +
  `${data.invoiceDate.getFullYear()} р.`;
doc.font('regular').text(str, { width: 320, align: 'center' });

// Table 1
doc.moveDown(1);
doc.fontSize(8);
str = 'Кореспонду-\nючий рахунок,\nсубрахунок' + '\nКод аналі-\nтичного\nобліку' +
  '\nСума\nцифрами' + '\n\nКод цільового\nпризначення';
doc.font('regular').text(str, 23, 148,
  { width: 266, height: 35, align: 'center', columns: 4, columnGap: 0 });

doc.lineWidth(2);
doc.rect(20, 144, 310, 57).stroke();
doc.lineWidth(1);
doc.moveTo(87, 144).lineTo(87, 201).stroke();
doc.moveTo(156, 144).lineTo(156, 201).stroke();
doc.moveTo(218, 144).lineTo(218, 201).stroke();
doc.moveTo(290, 144).lineTo(290, 201).stroke();
doc.moveTo(20, 185).lineTo(330, 185).stroke();

// Section "Прийнято від"
doc.moveDown(4);
doc.fontSize(9);
str = 'Прийнято від  ';
doc.font('bold').text(str, { width: 320, continued: true });
str = `  ${data.firstName} ${data.patronomic} ${data.surname}  `;
doc.font('regular').text(str, { underline: true, continued: true });
str = ' кв. № ';
doc.font('regular').text(str, { underline: false, continued: true });
str = ` ${data.flatNum} `;
doc.font('regular').text(str, { underline: true });

// SEction and Table "Підстава"
doc.moveDown(0.1);
doc.fontSize(9);
str = 'Підстава';
doc.font('bold').text(str);

doc.lineWidth(1);
doc.rect(20, 240, 310, 76).stroke();
doc.moveTo(20, 260).lineTo(330, 260).stroke();
doc.moveTo(20, 274).lineTo(330, 274).stroke();
doc.moveTo(20, 288).lineTo(330, 288).stroke();
doc.moveTo(20, 302).lineTo(330, 302).stroke();
doc.moveTo(80, 240).lineTo(80, 316).stroke();
doc.moveTo(140, 240).lineTo(140, 316).stroke();
doc.moveTo(200, 240).lineTo(200, 316).stroke();
doc.moveTo(260, 240).lineTo(260, 316).stroke();

doc.fontSize(7);
str = 'Наступний\nпоказник';
doc.font('regular').text(str, 81, 240, { width: 60, align: 'center' });
str = 'Попередній\nпоказник';
doc.font('regular').text(str, 141, 240, { width: 60, align: 'center' });
str = 'Різниця';
doc.font('regular').text(str, 198, 242, { width: 60, align: 'center' });
str = 'Сума до сплати';
doc.font('regular').text(str, 257, 242, { width: 76, align: 'center' });

doc.fontSize(9);
doc.font('regular').text('Квартплата', 23, 261);
doc.font('regular').text('РЕМ', 23, 275);
doc.font('regular').text('Вода', 23, 289);
doc.font('regular').text('Сміття', 23, 303);

// Section "Загальна сума"
doc.moveDown(1);
doc.fontSize(9);
str = 'Загальна сума _______________________________________________________________';
doc.font('bold').text(str);
str = '_______________________________________________________________грн._____коп.';
doc.font('regular').text(str);

doc.moveDown(0.1);
doc.fontSize(7);
str = '(словами)';
doc.font('regular').text(str, { width: 250, align: 'center' });

// Section "Головний бухгалтер"
doc.moveDown(2);
doc.fontSize(9);
str = 'Головний бухгалтер  ';
doc.font('bold').text(str, { width: 320, continued: true });
str = `     ${data.chiefAccounter}     `;
doc.font('regular').text(str, { underline: true });



doc.end();

