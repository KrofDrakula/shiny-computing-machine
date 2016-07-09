var flatten = require('../src/flatten'),
    expect = require('chai').expect;

describe('#flatten', () => {
  
  it('should return an empty array when empty', () => {
    expect(flatten([])).to.eql([]);
  });
  
  it('should return a new array as result', () => {
    let input = [];
    expect(flatten(input)).to.not.equal(input);
  });
  
  it('should return an array of same length if single-dimensional', () => {
    let input = [1, 2, 3, 4, 5];
    expect(flatten(input).length).to.equal(input.length);
  });
  
  it('should handle deeply-nested elements', () => {
    let input = [[[[[[[1]]]]]]];
    expect(flatten(input)).to.eql([1]);
  });
  
  it('should handle arbitrarily broad and nested elements', () => {
    let input = [[[[[1]], [[2]]]], 3, [[[[[[[4]]]]]]]];
    expect(flatten(input)).to.eql([1,2,3,4]);
  });
  
  it('should throw exception if not passed an array', () => {
    let input = 'throw up';
    expect(() => flatten(input)).to.throw(Error);
  });
  
});
