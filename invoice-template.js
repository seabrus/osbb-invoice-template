const PDFDocument = require('pdfkit');
const fs = require('fs');
const createInvoicePDF = require('./create-Invoice-pdf');


// Initial data object (prepared to use as JSON)  // "Олена Петрівна Гонтар",
const data = {
  "codeEDRPOU": "36325800",
  "orgName": "ОСББ «Хотинська 49М»",
  "orderNum": "264",
  "firstName": "Тарас",
  "patronomic": "Григорович",
  "surname": "Шевченко",
  "flatNum": "147",
  "chiefAccounter": "Анастасія Митрофанівна Стромбурлецька-Чорна",
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
      "summa": 47.23
    },
    {
      "name": "Вода",
      "shortName": "Вода",
      "tarif": 100.8,
      "nastupPokaznik": 5674,
      "poperedPokaznik": 5670,
      "riznitsa": 4,
      "summa": 65.82
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
createInvoicePDF(doc, data);
doc.end();
