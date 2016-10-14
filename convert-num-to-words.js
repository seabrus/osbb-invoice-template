// Auxiliary function
function subNum(numStr, start, len) {
  if (start > numStr.length) {
    return 0;
  }
  return Number(numStr.substr(numStr.length - start, len));
}

/**
 * Converts numbers into words
 * @param {String} num - The number to convert
 * @returns string
 */
module.exports = function (num) {
  // Locale
  const NOL = 'нуль';
  const ODIN = 'один';
  const ODNA = 'одна';
  const DVA = 'два';
  const DVI = 'дві';
  const WORDS = [
    ['', '', '', '', 'тисяч', 'мілліонов', 'мільярдів'],
    ['одна', 'одинадцять', 'десять', 'сто', 'тисяча', 'мілліон', 'мільярд'],
    ['дві', 'дванадцять', 'двадцять', 'двісті', 'тисячі', 'мілліона', 'мільярда'],
    ['три', 'тринадцять', 'тридцять', 'триста', 'тисячі', 'мілліона', 'мільярда'],
    ['чотири', 'чотирнадцять', 'сорок', 'чотириста', 'тисячі', 'мільйона', 'мільярда'],
    ['п\'ять', 'п\'ятнадцять', 'п\'ятдесят', 'п\'ятсот', 'тисяч', 'мільйонів', 'мільярдів'],
    ['шість', 'шістнадцять', 'шістдесят', 'шістсот', 'тисяч', 'мільйонів', 'мільярдів'],
    ['сім', 'сімнадцять', 'сімдесят', 'сімсот', 'тисяч', 'мільйонів', 'мільярдів'],
    ['вісім', 'вісімнадцять', 'вісімдесят', 'вісімсот', 'тисяч', 'мільйонів', 'мільярдів'],
    ['дев\'ять', 'дев\'ятнадцять', 'дев\'яносто', 'дев\'ятсот', 'тисяч', 'мільйонів', 'мільярдів'],
  ];

  // Check the input data
  if (!parseInt(num, 10)) {
    console.log('num2str error: Not numeric argument');
    return NOL;
  }
  var numStr = String(parseInt(num, 10));
  if (numStr.length > 12) {
    console.log('num2str error: The number is too large');
    return NOL;
  }
  if (numStr.slice(0, 1) === '-') {
    numStr = numStr.slice(1);
  }

  // Convertion
  var units = '';
  var tens = '';
  var hundreds = '';
  var words = '';

  for (var i = 0; i < numStr.length; i += 3) {
    units = '';
    tens = '';
    if (subNum(numStr, i + 2, 2) > 10 && subNum(numStr, i + 2, 2) < 20) {
      units = ` ${WORDS[subNum(numStr, i + 1, 1)][1]} ${WORDS[0][i / 3 + 3]}`;
    } else {
      units = WORDS[subNum(numStr, i + 1, 1)][0];
      if (units === ODIN && i === 3) units = ODNA;
      if (units === DVA && i === 3) units = DVI;
      if (!(i === 0 && units !== '')) units += ` ${WORDS[subNum(numStr, i + 1, 1)][i / 3 + 3]}`;
      if (units === ' ') units = '';
      if (units !== ` ${WORDS[subNum(numStr, i + 1, 1)][i / 3 + 3]}`) units = ` ${units}`;

      tens = WORDS[subNum(numStr, i + 2, 1)][2];
      if (tens !== '') {
        tens = ` ${tens}`;
      }
    }

    hundreds = '';
    hundreds = WORDS[subNum(numStr, i + 3, 1)][3];
    if (hundreds !== '') {
      hundreds = ` ${hundreds}`;
    }

    if (numStr.substr(numStr.length - i - 3, 3) === '000' && units === ` ${WORDS[0][i / 3 + 3]}`) {
      units = '';
    }

    words = hundreds + tens + units + words;
  }

  if (words === ' ') {
    return NOL;
  }
  return words.slice(1).trim();
}
