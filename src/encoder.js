var dictionary = require('./dictionary'),
    SYMBOLS    = require('./symbols'),
    MATCHERS   = require('./matchers');


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
      tokens.push({ type: SYMBOLS.WORD, value: word.toUpperCase() });
      continue;
    }
    
    // handle punctuation, emit a single token
    if (dictionary.isPunctuation(char)) {
      tokens.push({ type: SYMBOLS.PUNCTUATION, value: char });
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
function createCipherStream(tokens, useObfuscation = false, wordSeparator = SYMBOLS.WORD_SEPARATOR, charSeparator = SYMBOLS.CHARACTER_SEPARATOR) {
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
    .replace(MATCHERS.DOTS, dotsToSymbol)
    .replace(MATCHERS.DASHES, dashesToSymbol);
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

module.exports = { encode, tokenizePlaintext, createCipherStream, encodeWord, obfuscate };
