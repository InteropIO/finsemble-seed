const isEqual = require('lodash.isequal');

export function findAll(tree, childrenKey, objToFindBy) {
  let objToReturn = [];
  function innerFunc(tree, childrenKey, objToFindBy) {
    const findKeys = Object.keys(objToFindBy);
    let findSuccess = false;
    findKeys.forEach((key) => {
      isEqual(tree[key], objToFindBy[key]) ? findSuccess = true : findSuccess = false;
    });
    if (findSuccess) {
      objToReturn.push(tree);
    }
    if (tree.hasOwnProperty(childrenKey)) {
      for (let n of tree[childrenKey]) {
        innerFunc(n, childrenKey, objToFindBy);
      }
    }
  }
  innerFunc(tree, childrenKey, objToFindBy);
  return objToReturn;
};