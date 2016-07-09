var dictionary       = require('./dictionary'),
    SYMBOLS          = require('./symbols'),
    DOTS_MATCHER     = /\.+/g,
    DASHES_MATCHER   = /-+/g,
    NUMBER_MATCHER   = /[1-6]/g,        // the largest Morse code point is 6 characters long
    LETTER_MATCHER   = /[a-f]/gi,       // same here
    CODEPOINT_TESTER = /^[1-6a-f.-]$/i;


//             ____                     _ _             
//            |  _ \  ___  ___ ___   __| (_)_ __   __ _ 
//            | | | |/ _ \/ __/ _ \ / _` | | '_ \ / _` |
//            | |_| |  __/ (_| (_) | (_| | | | | | (_| |
//            |____/ \___|\___\___/ \__,_|_|_| |_|\__, |
//                                                |___/ 

function decode(cipherText) {
  let lines = cipherText.split('\n'),
      tokenizedLines = lines.map(line => tokenizeCipher(line)),
      reconstructedLines = tokenizedLines.map(line => reconstructText(line));
  
  return reconstructedLines.join('\n');
}

function tokenizeCipher(cipher, wordSeparator = SYMBOLS.WORD_SEPARATOR, charSeparator = SYMBOLS.CHARACTER_SEPARATOR) {
  let tokens = [], index = 0, codePoint = '';
  
  while(index < cipher.length) {
    let char = cipher[index];
    
    if (isCodePointPart(char)) {
      while(isCodePointPart(char)) {
        codePoint += deobfuscate(char);
        char = cipher[++index];
      }
      continue;
    }
    
    if (char == charSeparator) {
      commitCodePoint();
      tokens.push({ type: SYMBOLS.MORSE_CHARACTER_SEPARATOR, value: charSeparator });
      index++;
      continue;
    }
    
    if (char == wordSeparator) {
      commitCodePoint();
      tokens.push({ type: SYMBOLS.MORSE_WORD_SEPARATOR, value: wordSeparator });
      index++;
      continue;
    }
    
    // ignore all non-cipher characters
    index++;
  }
  
  commitCodePoint();
  
  return tokens;
  
  function commitCodePoint() {
    if (codePoint)
      tokens.push({ type: SYMBOLS.MORSE_CODEPOINT, value: codePoint });
    codePoint = '';
  }
}

// deobfuscates a single Morse code point
function deobfuscate(morseChar) {
  let result = morseChar
    .replace(NUMBER_MATCHER, numberToDots)
    .replace(LETTER_MATCHER, letterToDashes)
    .replace(/[^.-]/g, '');
  return result;

  function numberToDots(number) {
    return '.'.repeat(~~number);
  }
  
  function letterToDashes(letter) {
    return '-'.repeat(letter.toUpperCase().codePointAt(0) - 64);
  }
}

function decodeCodePoint(codePoint) {
  return dictionary.reverseMap.has(codePoint) ? dictionary.reverseMap.get(codePoint) : '';
}

function reconstructText(tokens) {
  let text = '';
  tokens.forEach(token => {
    switch (token.type) {
      case SYMBOLS.MORSE_CODEPOINT:
        let char = decodeCodePoint(token.value);
        text += char;
        previous = char;
        break;
      case SYMBOLS.MORSE_WORD_SEPARATOR:
        text += ' ';
        break;
    }
  });
  
  // make punctuation stick to the left character
  text = text.replace(/\s+([.,])/g, '$1');
  
  return text;
}

function isCodePointPart(char) {
  return CODEPOINT_TESTER.test(char);
}


module.exports = { decode, tokenizeCipher, deobfuscate, reconstructText };
