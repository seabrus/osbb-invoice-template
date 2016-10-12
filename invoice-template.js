const fs = require('fs');
const PDFDocument = require('pdfkit');


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
doc.registerFont('regular', 'fonts/DejaVuSans.ttf');
doc.registerFont('italic', 'fonts/DejaVuSans-Oblique.ttf');
doc.registerFont('bold', 'fonts/DejaVuSans-Bold.ttf');
doc.registerFont('bold-italic', 'fonts/DejaVuSans-BoldOblique.ttf');

// Initial data
const data = {
  codeEDRPOU: '36325800',
  orgName: 'ОСББ «Хотинська 49М»',
  orderNum: '264',
  firstName: 'John',
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
doc.font('regular').text(`Ідентифікаційний код ЄДРПОУ    `, 20, 40, { continued: true });
doc.font('bold').text(data.codeEDRPOU);
doc.lineWidth(1);
doc.rect(155, 36, 70, 17);

doc.moveDown(1);
doc.fontSize(9);
doc.font('bold-italic').text(` ${data.orgName} `, { width: 320, align: 'center' });
doc.moveTo(20, 70).lineTo(320, 70).stroke();

doc.moveDown(0.2);
doc.fontSize(7);
doc.font('regular').text('(найменування підприємства (установи, організації)',
  { width: 320, align: 'center' });

doc.moveDown(2.5);
doc.fontSize(11);
doc.font('bold').text('ПРИБУТКОВИЙ КАСОВИЙ ОРДЕР №    ',
  { width: 320, align: 'center', continued: true });
doc.font('bold').text(data.orderNum, { underline: true });





doc.end();

