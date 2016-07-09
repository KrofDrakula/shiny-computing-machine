var dictionary          = require('./dictionary'),
    WORD                = Symbol('WORD'),
    PUNCTUATION         = Symbol('PUNCTUATION'),
    CHARACTER_SEPARATOR = '|',
    WORD_SEPARATOR      = '/',
    DOTS_MATCHER        = /\.+/g,
    DASHES_MATCHER      = /-+/g,
    NUMBER_MATCHER      = /[1-9]/g,
    LETTER_MATCHER      = /[a-z]/gi;




//         _____                     _ _             
//        | ____|_ __   ___ ___   __| (_)_ __   __ _ 
//        |  _| | '_ \ / __/ _ \ / _` | | '_ \ / _` |
//        | |___| | | | (_| (_) | (_| | | | | | (_| |
//        |_____|_| |_|\___\___/ \__,_|_|_| |_|\__, |
//                                             |___/ 


// this function takes plaintext and outputs the cipher;
// each line is treated as a separate cipher stream
function encode(text, useObfuscation = false) {
  let lines          = text.split('\n'),
      tokenizedLines = lines.map(line => tokenizePlaintext(line)),
      cipherStreams  = tokenizedLines.map(tokens => createCipherStream(tokens, useObfuscation));
  return cipherStreams.join('\n');
}


// takes a single line's text and tokenizes it for the encoder
function tokenizePlaintext(text) {
  text = text.toUpperCase();
  let tokens = [], index = 0;
  
  while(index < text.length) {
    let char = text[index];
    
    // handle alphanumeric words
    if (dictionary.isAlphanumeric(char)) {
      let word = '';
      // keep adding characters to the word until we reach the end of the word
      while(dictionary.isAlphanumeric(char)) {
        word += char;
        char = text[++index];
      }
      tokens.push({ type: WORD, value: word.toUpperCase() });
      continue;
    }
    
    // handle punctuation, emit a single token
    if (dictionary.isPunctuation(char)) {
      tokens.push({ type: PUNCTUATION, value: char });
      index++;
      continue;
    }
    
    // no need to handle whitespace, as it will be inferred
    // by the sequence of tokens
    
    // We will silently discard all unknown characters;
    // alternatively, we could raise an error here if
    // we wanted to have a strict parser, but we're going
    // for graceful degradation.
    index++;
  }
  
  return tokens;
}

// takes a stream of tokens and generates the cipher stream
function createCipherStream(tokens, useObfuscation = false, wordSeparator = WORD_SEPARATOR, charSeparator = CHARACTER_SEPARATOR) {
  let codeStream = [], previous = null;
  tokens.forEach(token => {
    if (previous)
      codeStream.push(wordSeparator);
    codeStream.push(encodeWord(token.value, charSeparator, useObfuscation));
    previous = token;
  });
  return codeStream.join('');
}

// encodes a single word into its cipher text, optionally obfuscating
function encodeWord(word, separator, useObfuscation = false) {
  let ret = [];
  for (let char of word) {
    let encoded = dictionary.forwardMap.get(char);
    if (useObfuscation)
      encoded = obfuscate(encoded);
    ret.push(encoded);
  }
  return ret.join(separator);
}

// obfuscates the Morse code point using run length encoding
function obfuscate(morseChar) {
  let result = morseChar
    .replace(DOTS_MATCHER, dotsToSymbol)
    .replace(DASHES_MATCHER, dashesToSymbol);
  return result;
  
  // sequential dots are encoded using numerals
  function dotsToSymbol(dots) {
    return dots.length.toString();
  }

  // sequential dashes are encoded using letters, starting with A (65)
  function dashesToSymbol(dashes) {
    return String.fromCharCode(64 + dashes.length);
  }
}




//             ____                     _ _             
//            |  _ \  ___  ___ ___   __| (_)_ __   __ _ 
//            | | | |/ _ \/ __/ _ \ / _` | | '_ \ / _` |
//            | |_| |  __/ (_| (_) | (_| | | | | | (_| |
//            |____/ \___|\___\___/ \__,_|_|_| |_|\__, |
//                                                |___/ 

function decode(cipherText) {
  
}

function tokenizeCipher(cipher) {
  
}

function deobfuscate(morseChar) {
  let result = morseChar
    .replace(NUMBER_MATCHER, numberToDots)
    .replace(LETTER_MATCHER, letterToDashes);
  return result;

  function numberToDots(number) {
    return '.'.repeat(~~number);
  }
  
  function letterToDashes(letter) {
    return '-'.repeat(letter.codePointAt(0) - 64);
  }
}

function reconstructText(tokens) {
  
}


module.exports = {
  // encoding
  encode,
  tokenizePlaintext,
  createCipherStream,
  encodeWord,
  obfuscate,
  // decoding
  decode,
  tokenizeCipher,
  deobfuscate,
  reconstructText,
  // types
  WORD,
  PUNCTUATION
};
