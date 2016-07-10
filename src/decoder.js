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

// tokenizes a line of cipher text into Morse code points and word separators
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
    
    // instead of just emitting the code point, we must insert
    // a word separator between code points
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
  
  // a convenience function that emits a code point based
  // on the code point parts collected so far
  function commitCodePoint() {
    if (codePoint)
      tokens.push({ type: SYMBOLS.MORSE_CODEPOINT, value: codePoint });
    codePoint = '';
  }
}

// deobfuscates a single obfuscated Morse code point into its
// proper Morse code point; it doesn't validate the resulting
// code point and removes all non-Morse characters from the
// sequence
function deobfuscate(morseChar) {
  let result = morseChar
    .replace(MATCHERS.NUMBER, numberToDots)
    .replace(MATCHERS.LETTER, letterToDashes)
    .replace(/[^.-]/g, '');
  return result;

  // simple coercion from numbers to sequences of dots (1 = ., 2 = .., etc.)
  function numberToDots(number) {
    return '.'.repeat(~~number);
  }
  
  // use the ASCII value of the letter to determine repeat count (A ~ 65 = -, B ~ 66 = --, etc.)
  function letterToDashes(letter) {
    return '-'.repeat(letter.toUpperCase().codePointAt(0) - 64);
  }
}

// translates a single code point to a plaintext character;
// returns empty string when the code point is invalid
function decodeCodePoint(codePoint) {
  return dictionary.reverseMap.has(codePoint) ? dictionary.reverseMap.get(codePoint) : '';
}

// takes a list of tokens and reconstructs the original message
// with simple stylistic rules:
//   - no leading space before punctuation
//   - single trailing space after punctuation
//   - no leading/trailing/duplicated whitespace
function reconstructText(tokens) {
  let text = '', previous = null;
  tokens.forEach(token => {
    switch (token.type) {
      case SYMBOLS.MORSE_CODEPOINT:
        // a code point can be emitted directly into the text
        let char = decodeCodePoint(token.value);
        text += char;
        previous = char;
        break;
      case SYMBOLS.MORSE_WORD_SEPARATOR:
        // only insert a space if preceded by a code point
        if (previous && previous.type === SYMBOLS.MORSE_CODEPOINT)
          text += ' ';
        break;
    }
    previous = token;
  });
  
  
  // trailing spaces
  text = text
    .replace(/\s+([.,])/g, '$1') // remove leading spaces before punctuation
    .replace(/\s+$/, '');        // remove trailing spaces
  
  return text;
}

// identifies a character as a valid code point part
function isCodePointPart(char) {
  return MATCHERS.CODEPOINT_PART.test(char);
}


module.exports = { decode, tokenize, deobfuscate, reconstructText };
