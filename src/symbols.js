// this is a registry of symbols to signify different
// types of tokens within streams
module.exports = {
  WORD                      : Symbol('WORD'),
  PUNCTUATION               : Symbol('PUNCTUATION'),
  MORSE_CODEPOINT           : Symbol('MORSE_CODEPOINT'),
  MORSE_CHARACTER_SEPARATOR : Symbol('MORSE_CHARACTER_SEPARATOR'),
  MORSE_WORD_SEPARATOR      : Symbol('MORSE_WORD_SEPARATOR'),
  CHARACTER_SEPARATOR       : '|',
  WORD_SEPARATOR            : '/',
};
