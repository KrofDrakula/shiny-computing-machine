module.exports = {
  DOTS           : /\.+/g,
  DASHES         : /-+/g,
  NUMBER         : /[1-6]/g,        // the largest Morse code point is 6 characters long
  LETTER         : /[a-f]/gi,       // same here
  CODEPOINT_PART : /^[1-6a-f.-]$/i
};
