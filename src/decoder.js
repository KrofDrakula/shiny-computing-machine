var dictionary = require('./dictionary'),
    SYMBOLS    = require('./symbols'),
    MATCHERS   = require('./matchers');


//             ____                     _ _             
//            |  _ \  ___  ___ ___   __| (_)_ __   __ _ 
//            | | | |/ _ \/ __/ _ \ / _` | | '_ \ / _` |
//            | |_| |  __/ (_| (_) | (_| | | | | | (_| |
//            |____/ \___|\___\___/ \__,_|_|_| |_|\__, |
//                                                |___/ 


// decodes multiline cipher text and returns the
// reconstructed text as a string, optionally stripping
// empty lines from the decoded output
function decode(cipherText, stripEmptyLines = false) {
  let lines = cipherText.split('\n'),
      tokenizedLines = lines.map(line => tokenize(line)),
      reconstructedLines = tokenizedLines.map(line => reconstructText(line));
  
  if (stripEmptyLines)
    reconstructedLines = reconstructedLines.filter(line => line.length > 0);
  
  return reconstructedLines.join('\n');
}

function tokenize(cipher, wordSeparator = SYMBOLS.WORD_SEPARATOR, charSeparator = SYMBOLS.CHARACTER_SEPARATOR) {
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
    .replace(MATCHERS.NUMBER, numberToDots)
    .replace(MATCHERS.LETTER, letterToDashes)
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
  let text = '', previous = null;
  tokens.forEach(token => {
    switch (token.type) {
      case SYMBOLS.MORSE_CODEPOINT:
        let char = decodeCodePoint(token.value);
        text += char;
        previous = char;
        break;
      case SYMBOLS.MORSE_WORD_SEPARATOR:
        if (previous && previous.type === SYMBOLS.MORSE_CODEPOINT)
          text += ' ';
        break;
    }
    previous = token;
  });
  
  // make punctuation stick to the left character and remove
  // trailing spaces
  text = text.replace(/\s+([.,])/g, '$1').replace(/\s+$/, '');
  
  return text;
}

function isCodePointPart(char) {
  return MATCHERS.CODEPOINT_PART.test(char);
}


module.exports = { decode, tokenize, deobfuscate, reconstructText };
