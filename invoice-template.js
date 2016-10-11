const fs = require('fs');
const PDFDocument = require('pdfkit');


// Stream to pipe to the resulting PDF
const upload = fs.createWriteStream('test.pdf');

// PDF documrnt
const doc = new PDFDocument({
  size: 'A5', // 148 × 210
  layout: 'landscape',
  margins: {
    top: 40, // 72 per inch, 0,0353 cm
    bottom: 40,
    left: 20,
    right: 20,
  },
  info: {
    Title: 'Invoice',
    Author: 'osbb',
  },
});
doc.pipe(upload);

// Fonts registration
doc.registerFont('regular', 'fonts/DejaVuSans.ttf');
doc.registerFont('italic', 'fonts/DejaVuSans-Oblique.ttf');
doc.registerFont('bold', 'fonts/DejaVuSans-Bold.ttf');
doc.registerFont('bold-italic', 'fonts/DejaVuSans-BoldOblique.ttf');
// є і ї ґ Є І Ї Ґ

// Initial data
const data = {
  codeEDRPOU: '36325800',
  orgName: 'ОСББ «Хотинська 49М»',
  firstName: 'John',
};

doc.fontSize(10);

doc.font('regular').text(`Ідентифікаційний код ЄДРПОУ    `, { continued: true });
doc.font('bold').text(data.codeEDRPOU);
doc.rect(188, 35, 90, 20);

doc.moveDown(1);
doc.font('bold-italic').text(` ${data.orgName} `, { width: 320, align: 'center' });

doc.moveTo(20, 74).lineTo(320, 74).stroke();

doc.fontSize(8);
doc.font('regular').text('(найменування підприємства (установи, організації)',
  { width: 320, align: 'center' });


doc.moveDown(1.5);


doc.end();

