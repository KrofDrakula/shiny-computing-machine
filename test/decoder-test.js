var decoder = require('../src/decoder'),
    SYMBOLS = require('../src/symbols'),
    expect  = require('chai').expect;

describe('@decoder', () => {
  
  describe('#deobfuscate', () => {
    
    it('should expand numbers and letters into respective symbols', () => {
      let result = decoder.deobfuscate('1a2B');
      expect(result).to.equal('.-..--');
    });
    
    it('should handle mixed-mode obfuscation', () => {
      expect(decoder.deobfuscate('1A---2b')).to.equal('.----..--');
    });
    
    it('should eliminate invalid characters', () => {
      expect(decoder.deobfuscate('%%-.c4$')).to.equal('-.---....');
    });
    
  });
  
  describe('#tokenize', () => {
    
    it('should return an empty array for an empty cipher', () => {
      expect(decoder.tokenize('')).to.eql([]);
    });
    
    it('should correctly tokenize a single character', () => {
      let result = decoder.tokenize('.');
      expect(result.length).to.equal(1);
      expect(result[0].type).to.equal(SYMBOLS.MORSE_CODEPOINT);
      expect(result[0].value).to.equal('.');
    });
    
    it('should correctly tokenize a multicharacter word', () => {
      let result = decoder.tokenize('.-|-...'),
          tokens = result.map(item => item.value);
      expect(tokens).to.eql(['.-', '|','-...']);
    });
    
    it('should correctly tokenize a multiword cipher', () => {
      let result = decoder.tokenize('.-|-.../-.-.|-..'),
          tokens = result.map(item => item.value);
      expect(tokens).to.eql([
        '.-',
        '|',
        '-...',
        '/',
        '-.-.',
        '|',
        '-..'
      ]);
    });
    
    it('should ignore all non-cipher characters', () => {
      let result = decoder.tokenize('.~-|-#.@.$.'),
          tokens = result.map(item => item.value);
      expect(tokens).to.eql(['.-', '|', '-...']);
    });
    
    it('should tokenize HELLO WORLD correctly', () => {
      let result = decoder.tokenize('4|1|1A2|1a2|C/.--|---|.-.|.-..|-..'),
          tokens = result.map(item => item.value);
      expect(tokens.length).to.equal(19);
      expect(tokens[1]).to.equal('|');
      expect(tokens[4]).to.equal('.-..');
      expect(tokens[18]).to.equal('-..');
    });
    
  });
  
  describe('#reconstructText', () => {
    
    it('should return empty text for empty token list', () => {
      expect(decoder.reconstructText([])).to.eql('');
    });
    
    it('should return a single character for a single code point', () => {
      let tokens = [{ type: SYMBOLS.MORSE_CODEPOINT, value: '.' }];
      expect(decoder.reconstructText(tokens)).to.equal('E');
    });
    
    it('should reconstruct multicharacter words', () => {
      let tokens = [
            { type: SYMBOLS.MORSE_CODEPOINT, value: '.-' },
            { type: SYMBOLS.MORSE_CHARACTER_SEPARATOR, value: '|' },
            { type: SYMBOLS.MORSE_CODEPOINT, value: '-...' }
          ];
      
      expect(decoder.reconstructText(tokens)).to.equal('AB');
    });
    
    it('should reconstruct words', () => {
      let tokens = [
            { type: SYMBOLS.MORSE_CODEPOINT, value: '.-' },
            { type: SYMBOLS.MORSE_WORD_SEPARATOR, value: '/' },
            { type: SYMBOLS.MORSE_CODEPOINT, value: '-...' }
          ];
      
      expect(decoder.reconstructText(tokens)).to.equal('A B');
    });
    
    it('should decode punctuation with words', () => {
      let tokens = [
            { type: SYMBOLS.MORSE_CODEPOINT, value: '.-' },
            { type: SYMBOLS.MORSE_WORD_SEPARATOR, value: '/' },
            { type: SYMBOLS.MORSE_CODEPOINT, value: '.-.-.-' },
            { type: SYMBOLS.MORSE_WORD_SEPARATOR, value: '/' },
            { type: SYMBOLS.MORSE_CODEPOINT, value: '-...' }
          ];
      
      expect(decoder.reconstructText(tokens)).to.equal('A. B');
    });
    
  });
  
  describe('#decode', () => {
    
    it('should be able to decode the reference example', () => {
      expect(decoder.decode('4|1|1A2|1A2|C\n2/1A|B/2|A1/A|1A1|C|2A|A3|1A2|1')).to.equal('HELLO\nI AM IN TROUBLE');
    });
    
    it('should ignore invalid Morse code points', () => {
      expect(decoder.decode('---------------|.|-')).to.equal('ET');
    });
    
  });
  
});
