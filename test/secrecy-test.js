var secrecy = require('../src/secrecy'),
    expect  = require('chai').expect;

describe('@secrecy', () => {
  
  describe('#tokenizePlaintext', () => {
    
    it('should return an empty array of tokens on empty string', () => {
      expect(secrecy.tokenizePlaintext('')).to.eql([]);
    });
    
    it('should return a single token per word', () => {
      let result = secrecy.tokenizePlaintext('HELLO WORLD');
      expect(result[0].type).to.equal(secrecy.WORD);
      expect(result[0].value).to.equal('HELLO');
      expect(result[1].type).to.equal(secrecy.WORD);
      expect(result[1].value).to.equal('WORLD');
    });
    
    it('should treat unbroken strings of letters and numbers as a single word', () => {
      let result = secrecy.tokenizePlaintext('ALPHA1337');
      expect(result.length).to.equal(1);
      expect(result[0].value).to.equal('ALPHA1337');
    });
    
    it('should treat punctuation as separate tokens', () => {
      let result = secrecy.tokenizePlaintext('A,B');
      expect(result.length).to.equal(3);
    });
    
    it('should ignore unknown characters and whitespace, except for word separation', () => {
      let result = secrecy.tokenizePlaintext('  this     is!some wêìñđö T3xt  .   '),
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
  
  describe('#obfuscate', () => {
    
    it('should replace dots with numbers', () => {
      expect(secrecy.obfuscate('....')).to.equal('4');
      expect(secrecy.obfuscate('.')).to.equal('1');
    });
    
    it('should replace dashes with letters', () => {
      expect(secrecy.obfuscate('---')).to.equal('C');
      expect(secrecy.obfuscate('--')).to.equal('B');
    });
    
    it('should handle a combination of letters and numbers', () => {
      expect(secrecy.obfuscate('.-...--')).to.equal('1A3B');
    });
    
  });
  
  describe('#encodeWord', () => {
    
    it('should encode a word into valid Morse code', () => {
      let result = secrecy.encodeWord('TROUBLE', '|');
      expect(result).to.equal('-|.-.|---|..-|-...|.-..|.');
    });
    
  });
  
  describe('#createCipherStream', () => {
    
    it('should generate a single word from a single token', () => {
      let tokens = [{ type: secrecy.WORD, value: 'AB' }],
          result = secrecy.createCipherStream(tokens, false);
      expect(result).to.equal('.-|-...');
    });
    
    it('should generate a word separator between words', () => {
      let tokens = [
            { type: secrecy.WORD, value: 'A' },
            { type: secrecy.WORD, value: 'B' }
          ],
          result = secrecy.createCipherStream(tokens, false);
      expect(result).to.equal('.-/-...');
    });
    
    it('should separate punctuation from words with a word separator', () => {
      let tokens = [
            { type: secrecy.WORD, value: 'A' },
            { type: secrecy.PUNCTUATION, value: ',' },
            { type: secrecy.WORD, value: 'B' }
          ],
          result = secrecy.createCipherStream(tokens, false);
      expect(result).to.equal('.-/--..--/-...');
    });
    
  });
  
  describe('#encode', () => {
    
    it('should match the given challenge example', () => {
      let input  = 'HELLO\nI AM IN TROUBLE',
          output = '4|1|1A2|1A2|C\n2/1A|B/2|A1/A|1A1|C|2A|A3|1A2|1';
      expect(secrecy.encode(input, true)).to.equal(output);
    });
    
  });
  
  
  describe('#deobfuscate', () => {
    
    it('should expand numbers and letters into respective symbols', () => {
      let result = secrecy.deobfuscate('1A2B');
      expect(result).to.equal('.-..--');
    });
    
    it('should handle mixed-mode obfuscation', () => {
      expect(secrecy.deobfuscate('1A---2B')).to.equal('.----..--');
    });
    
    it('should eliminate invalid characters', () => {
      expect(secrecy.deobfuscate('%%-.c4$')).to.equal('-.---....');
    });
    
  });
  
});
