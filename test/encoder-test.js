var encoder = require('../src/encoder'),
    SYMBOLS = require('../src/symbols'),
    expect  = require('chai').expect;

describe('@encoder', () => {
  
  describe('#encodeWord', () => {
    
    it('should encode a word into valid Morse code', () => {
      let result = encoder.encodeWord('TROUBLE', '|');
      expect(result).to.equal('-|.-.|---|..-|-...|.-..|.');
    });
    
  });
  
  describe('#obfuscate', () => {
    
    it('should replace dots with numbers', () => {
      expect(encoder.obfuscate('....')).to.equal('4');
      expect(encoder.obfuscate('.')).to.equal('1');
    });
    
    it('should replace dashes with letters', () => {
      expect(encoder.obfuscate('---')).to.equal('C');
      expect(encoder.obfuscate('--')).to.equal('B');
    });
    
    it('should handle a combination of letters and numbers', () => {
      expect(encoder.obfuscate('.-...--')).to.equal('1A3B');
    });
    
  });
  
  describe('#tokenize', () => {
    
    it('should return an empty array of tokens on empty string', () => {
      expect(encoder.tokenize('')).to.eql([]);
    });
    
    it('should tokenize a single letter', () => {
      let result = encoder.tokenize('a');
      expect(result.length).to.equal(1);
    });
    
    it('should return a single token per word', () => {
      let result = encoder.tokenize('HELLO WORLD');
      expect(result[0].type).to.equal(SYMBOLS.WORD);
      expect(result[0].value).to.equal('HELLO');
      expect(result[1].type).to.equal(SYMBOLS.WORD);
      expect(result[1].value).to.equal('WORLD');
    });
    
    it('should treat unbroken strings of letters and numbers as a single word', () => {
      let result = encoder.tokenize('ALPHA1337');
      expect(result.length).to.equal(1);
      expect(result[0].value).to.equal('ALPHA1337');
    });
    
    it('should treat punctuation as separate tokens', () => {
      let result = encoder.tokenize('A,B');
      expect(result.length).to.equal(3);
    });
    
    it('should ignore unknown characters and whitespace, except for word separation', () => {
      let result = encoder.tokenize('  this     is!some wêìñđö T3xt  .   '),
          words  = result.map(token => token.value);
      
      expect(words).to.eql([
        'THIS',   // ignore leading whitespace
        'IS',     // word separated by unknown character
        'SOME',
        'W',      // all unknown characters thrown out
        'T3XT',   // letters and numbers are words
        '.'       // commas and periods are OK
      ]);
    });
    
  });
  
  describe('#createCipherText', () => {
    
    it('should generate a single word from a single token', () => {
      let tokens = [{ type: SYMBOLS.WORD, value: 'AB' }],
          result = encoder.createCipherText(tokens, false);
      expect(result).to.equal('.-|-...');
    });
    
    it('should generate a word separator between words', () => {
      let tokens = [
            { type: SYMBOLS.WORD, value: 'A' },
            { type: SYMBOLS.WORD, value: 'B' }
          ],
          result = encoder.createCipherText(tokens, false);
      expect(result).to.equal('.-/-...');
    });
    
    it('should separate punctuation from words with a word separator', () => {
      let tokens = [
            { type: SYMBOLS.WORD, value: 'A' },
            { type: SYMBOLS.PUNCTUATION, value: ',' },
            { type: SYMBOLS.WORD, value: 'B' }
          ],
          result = encoder.createCipherText(tokens, false);
      expect(result).to.equal('.-/--..--/-...');
    });
    
  });
  
  describe('#encode', () => {
    
    it('should match the given challenge example', () => {
      let input  = 'HELLO\nI AM IN TROUBLE',
          output = '4|1|1A2|1A2|C\n2/1A|B/2|A1/A|1A1|C|2A|A3|1A2|1';
      expect(encoder.encode(input, true)).to.equal(output);
    });
    
  });
  
});
