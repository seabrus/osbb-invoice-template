const fs = require('fs');
const PDFDocument = require('pdfkit');

const ukrMonths = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня',
  'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
var str ='';


// Stream to pipe to the resulting PDF
const upload = fs.createWriteStream('test.pdf');

// PDF documrnt
const doc = new PDFDocument({
  size: 'A5', // 148 × 210 === 420 × 595   - 72 per inch, 28,35 p/cm
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

// Fonts registration. є і ї ґ Є І Ї Ґ
  //doc.registerFont('regular', 'fonts/DejaVuSans.ttf');
  //doc.registerFont('italic', 'fonts/DejaVuSans-Oblique.ttf');
  //doc.registerFont('bold', 'fonts/DejaVuSans-Bold.ttf');
  //doc.registerFont('bold-italic', 'fonts/DejaVuSans-BoldOblique.ttf');
doc.registerFont('regular', 'fonts/NotoSans-Regular.ttf');
doc.registerFont('italic', 'fonts/NotoSans-Italic.ttf');
doc.registerFont('bold', 'fonts/NotoSans-Bold.ttf');
doc.registerFont('bold-italic', 'fonts/NotoSans-BoldItalic.ttf');

// Initial data
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

// Left pane
doc.fontSize(8);
str = `Ідентифікаційний код ЄДРПОУ    `;
doc.font('regular').text(str, 20, 40, { continued: true });
doc.font('bold').text(data.codeEDRPOU);
doc.lineWidth(1);
doc.rect(145, 39, 60, 14).stroke();

doc.moveDown(1);
doc.fontSize(9);
doc.font('bold-italic').text(` ${data.orgName} `, { width: 320, align: 'center' });
doc.moveTo(20, 74).lineTo(320, 74).stroke();

doc.moveDown(0.2);
doc.fontSize(7);
str = '(найменування підприємства (установи, організації)';
doc.font('regular').text(str, { width: 320, align: 'center' });

doc.moveDown(2.5);
doc.fontSize(11);
str = 'ПРИБУТКОВИЙ КАСОВИЙ ОРДЕР №      ';
doc.font('bold').text(str, { width: 320, align: 'center', continued: true });
doc.font('bold').text(`  ${data.orderNum}  `, { underline: true });

doc.fontSize(8);
str = `від « ${data.invoiceDate.getDate()} »  ${ukrMonths[data.invoiceDate.getMonth()]} ` +
  `${data.invoiceDate.getFullYear()} р.`;
doc.font('regular').text(str, { width: 320, align: 'center' });

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

doc.moveDown(4);
doc.fontSize(9);
str = 'Прийнято від  ';
doc.font('bold').text(str, { width: 320, continued: true });
str = `${data.firstName} ${data.patronomic} ${data.surname}  кв. № ${data.flatNum}`;
doc.font('regular').text(str);

doc.moveDown(0.1);
doc.fontSize(9);
str = 'Підстава';
doc.font('bold').text(str);

doc.moveDown(2);
doc.fontSize(9);
str = 'Загальна сума ___________________________________________________________';
doc.font('bold').text(str);
str = '____________________________________________________________грн._____коп.';
doc.font('regular').text(str);

doc.moveDown(0.1);
doc.fontSize(7);
str = '(словами)';
doc.font('regular').text(str, { width: 250, align: 'center' });

doc.moveDown(2);
doc.fontSize(9);
str = 'Головний бухгалтер  ';
doc.font('bold').text(str, { width: 320, continued: true });
str = `     ${data.chiefAccounter}     `;
doc.font('regular').text(str, { underline: true });



doc.end();

