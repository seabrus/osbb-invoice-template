import { getRabbitConnection } from './rabbit-connection';
import winston from 'winston';
import uuid from 'uuid';
import PDFDocument from 'pdfkit';
import { S3 } from 'aws-sdk';
import { WriteStream } from 's3-streams';


/**
 * Draws an invoice as a PDF document
 * @param {PDFDocument} doc - PDFDocument document to write to
 * @param {Object} data - Initial data to build an invoice
 * @returns none
 * @example of the "data" param:
    const data = {
      "codeEDRPOU": "36325800",
      "orgName": "ОСББ «Хотинська 49М»",
      "orderNum": "264",
      "firstName": "Тарас",
      "patronomic": "Григорович",
      "surname": "Шевченко",
      "flatNum": "147",
      "chiefAccounter": "Олена Петрівна Гонтар"
    };
 */
function createInvoicePDF(doc, data) {
  const ukrMonths = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
    'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  let str = '';

  const invoiceDate = new Date();

  // Fonts registration. Letters for convenience: є і ї ґ Є І Ї Ґ
  doc.registerFont('regular', 'fonts/NotoSans-Regular.ttf');
  doc.registerFont('italic', 'fonts/NotoSans-Italic.ttf');
  doc.registerFont('bold', 'fonts/NotoSans-Bold.ttf');
  doc.registerFont('bold-italic', 'fonts/NotoSans-BoldItalic.ttf');


  // Vertical lines and "Лінія відрізу"
  doc.dash(3, { space: 4 });
  doc.moveTo(340, 35).lineTo(340, 400).stroke();
  doc.moveTo(352, 35).lineTo(352, 400).stroke();
  doc.undash();

  doc.fontSize(8);
  doc.font('regular');
  doc.text('Л', 340, 70, { width: 12, align: 'center' });
  doc.text('і', 340, 85, { width: 12, align: 'center' });
  doc.text('н', 340, 100, { width: 12, align: 'center' });
  doc.text('і', 340, 115, { width: 12, align: 'center' });
  doc.text('я', 340, 130, { width: 12, align: 'center' });
  doc.text('в', 340, 190, { width: 12, align: 'center' });
  doc.text('і', 340, 205, { width: 12, align: 'center' });
  doc.text('д', 340, 220, { width: 12, align: 'center' });
  doc.text('р', 340, 235, { width: 12, align: 'center' });
  doc.text('і', 340, 250, { width: 12, align: 'center' });
  doc.text('з', 340, 265, { width: 12, align: 'center' });
  doc.text('у', 340, 280, { width: 12, align: 'center' });


  // >>>>> Left-hand pane <<<<<
  // Section "Ідентифікаційний код ЄДРПОУ"
  doc.fontSize(8);
  str = 'Ідентифікаційний код ЄДРПОУ    ';
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
  doc.font('bold').text(`${data.orderNum}`, { underline: true });

  // Subsection "Дата"
  doc.fontSize(8);
  str = `від « ${invoiceDate.getDate()} »  ${ukrMonths[invoiceDate.getMonth()]} ` +
    `${invoiceDate.getFullYear()} р.`;
  doc.font('regular').text(str, { width: 320, align: 'center' });

  // Table 1
  doc.moveDown(1);
  doc.fontSize(8);
  str = 'Кореспонду-\nючий рахунок,\nсубрахунок\nКод аналі-\nтичного\nобліку' +
    '\nСума\nцифрами\n\nКод цільового\nпризначення';
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

  // Section and Table "Підстава"
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


  // >>>>> Right-hand pane <<<<<
  doc.fontSize(7);
  str = 'типова форма № КО-1';
  doc.font('bold').text(str, 495, 40);

  // Section "найменування підприємства"
  doc.moveDown(1);
  doc.fontSize(9);
  str = ` ${data.orgName} `;
  doc.font('bold-italic').text(str, 370, 54, { width: 210, align: 'center' });
  doc.moveTo(370, 65).lineTo(570, 65).stroke();

  doc.fontSize(6);
  str = '(найменування підприємства (установи, організації)';
  doc.font('regular').text(str, 370, 65, { width: 210, align: 'center' });

  // Section "КВИТАНЦІЯ"
  doc.fontSize(11);
  str = 'КВИТАНЦІЯ';
  doc.font('bold').text(str, 357, 85, { width: 223, align: 'center' });
  doc.fontSize(9);
  str = 'до прибуткового касового ордеру №     ';
  doc.font('bold').text(str, { width: 223, align: 'center', continued: true });
  doc.font('bold').text(`${data.orderNum}`, { underline: true });

  // Subsection "Дата"
  doc.fontSize(8);
  str = `від « ${invoiceDate.getDate()} »  ${ukrMonths[invoiceDate.getMonth()]} ` +
    `${invoiceDate.getFullYear()} р.`;
  doc.font('regular').text(str, { width: 223, align: 'center' });

  // Section "Прийнято від"
  doc.moveDown(1);
  doc.fontSize(9);
  str = 'Прийнято від ';
  doc.font('bold').text(str, { width: 225, continued: true });
  str = ` ${data.firstName.slice(0, 1)}.${data.patronomic.slice(0, 1)}. ${data.surname} `;
  doc.font('regular').text(str, { underline: true, continued: true });
  str = ' кв. № ';
  doc.font('regular').text(str, { underline: false, continued: true });
  str = `${data.flatNum}`;
  doc.font('regular').text(str, { underline: true });

  // Section and Table "Підстава"
  doc.moveDown(0.1);
  doc.fontSize(9);
  str = 'Підстава';
  doc.font('bold').text(str);

  doc.lineWidth(1);
  doc.rect(357, 160, 223, 90).stroke();
  doc.moveTo(357, 180).lineTo(580, 180).stroke();
  doc.moveTo(357, 194).lineTo(580, 194).stroke();
  doc.moveTo(357, 208).lineTo(580, 208).stroke();
  doc.moveTo(357, 222).lineTo(580, 222).stroke();
  doc.moveTo(357, 236).lineTo(580, 236).stroke();
  doc.moveTo(400, 160).lineTo(400, 236).stroke();
  doc.moveTo(436, 160).lineTo(436, 236).stroke();
  doc.moveTo(472, 160).lineTo(472, 236).stroke();
  doc.moveTo(508, 160).lineTo(508, 236).stroke();
  doc.moveTo(537, 160).lineTo(537, 250).stroke();

  doc.fontSize(7);
  str = 'Тариф';
  doc.font('regular').text(str, 400, 165, { width: 35, align: 'center' });
  str = 'Наст.\nпоказник';
  doc.font('regular').text(str, 436, 160, { width: 35, align: 'center' });
  str = 'Попер.\nпоказник';
  doc.font('regular').text(str, 472, 160, { width: 35, align: 'center' });
  str = 'Різниця';
  doc.font('regular').text(str, 508, 165, { width: 31, align: 'center' });
  str = 'Сума до\nсплати ₴';
  doc.font('regular').text(str, 537, 160, { width: 43, align: 'center' });

  doc.fontSize(9);
  doc.font('regular').text('Кв.плата', 359, 181);
  doc.font('regular').text('РЕМ', 359, 195);
  doc.font('regular').text('Вода', 359, 209);
  doc.font('regular').text('Сміття', 359, 223);
  doc.font('regular').text('Всього:', 500, 237);

  // Section "Загальна сума"
  doc.moveDown(1.2);
  doc.fontSize(9);
  str = 'Загальна сума ______________________________________';
  doc.font('bold').text(str, 357, 270);
  doc.moveDown(0.1);
  doc.fontSize(7);
  str = '(словами)';
  doc.font('regular').text(str, { width: 223, align: 'center' });
  doc.fontSize(9);
  str = '________________________________________грн._____коп.';
  doc.font('regular').text(str);

  // Section "М.П."
  doc.moveDown(2.5);
  doc.fontSize(9);
  str = 'М.П.';
  doc.font('bold').text(str);

  // Section "Головний бухгалтер"
  doc.moveDown(2.8);
  doc.fontSize(9);
  str = 'Головний бухгалтер  ';
  doc.font('bold').text(str, { width: 320, continued: true });
  str = `   ${data.chiefAccounter}   `;
  doc.font('regular').text(str, { underline: true });
}

function sendResponseToMsg(ch, msg, data) {
  return ch.sendToQueue(
    msg.properties.replyTo,
    new Buffer(JSON.stringify(data)),
    { correlationId: msg.properties.correlationId }
  );
}

// wait for connection to RabbitMQ and MongoDB
getRabbitConnection()
// create channel rabbit
  .then(conn => conn.createChannel())
  .then(ch => {
    // create topic
    ch.assertExchange('events', 'topic', { durable: true });
    // create queue
    ch.assertQueue('invoices-printing-service', { durable: true })
      .then(q => {
        // fetch by one message from queue
        ch.prefetch(1);
        // bind queue to topic
        ch.bindQueue(q.queue, 'events', 'print.invoice');
        // listen to new messages
        ch.consume(q.queue, msg => {
          let data;

          try {
            // messages always should be JSONs
            data = JSON.parse(msg.content.toString());
          } catch (err) {
            // log error and exit
            winston.error(err, msg.content.toString());
            return;
          }

          const s3 = new S3();
          const Key = `${uuid.v4()}.pdf`;
          const Bucket = 'invoices-osbb';
          const upload = WriteStream(s3, {
            Bucket,
            Key,
            ContentType: 'application/pdf',
            ACL: 'public-read',
          });
          const doc = new PDFDocument({
            size: 'A5', // 148 mm × 210 mm === 420 × 595 - 72 per inch, 28,35 p/cm
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
          createInvoicePDF(doc, data);
          doc.end();

          s3.getSignedUrl('getObject', {
            Bucket,
            Key,
          }, (err, url) => {
            Promise.resolve(sendResponseToMsg(ch, msg, { url }))
              .then(() => ch.ack(msg));
          });
        });
      });
  });
