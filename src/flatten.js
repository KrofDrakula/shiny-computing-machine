function flatten(arr) {
  
  if (!Array.isArray(arr))
    throw new Error('Cannot flatten a non-array object!');
  
  let ret = [];
  
  // process each individual element; if an element is an
  // array, use recursion
  // 
  // CAVEAT: depending on the amount of nesting, this function
  //         might cause a stack overflow; would have to
  //         refactor if that is a potential concern
  arr.forEach(element => {
    let subelements = [];
    if (Array.isArray(element))
      subelements = flatten(element);
    else
      subelements = [element];
    subelements.forEach(item => ret.push(item));
  });
  
  return ret;
}

module.exports = flatten;
