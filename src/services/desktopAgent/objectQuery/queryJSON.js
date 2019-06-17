// const compare = (a, b) => {

//     if (typeof a === 'string' || a instanceof String) {
//         a = a.toLowerCase();
//     }

//     if (typeof b === 'string' || b instanceof String) {
//         b = b.toLowerCase();
//     }

//     return 0;

// };

// const getByProperty = (property, data) => {
//     if (!(property in data)) {
//         throw Error('Data not exists');
//     }

//     return data[property];
// };

// function hasMatch(str, pattern) {
//     return RegExp(pattern).test(str);
// }

// function isContain(str, val) {
//     return str.includes(val);
// }

// function isIn(key, arr) {
//     return Array.isArray(arr) && arr.includes(key);
// }

// function isEqual(a, b) {
//     return a == b;
// }

// function executeQuery(query, data) {
//     debugger;
//     return data.filter(elem => {
//         let orPassed = false;
//         let andPassed = true;

//         andPassed &= check(
//             elem[query.key],
//             query.op,
//             query.val
//         );


//         orPassed |= andPassed;


//         return orPassed;
//     });
// }

// function check(a, op, b) {
//     if (!(op)) {
//         throw Error('Invalid where condition given');
//     }

//     return op(a, b);
// }

// function where(json, key, op, val) {
//     return executeQuery({ key, op, val }, json);
// }

// function formatData(json) {
//     debugger;
//     if (Array.isArray(json)) {
//         return Array.from(json);
//     } else {
//         return JSON.parse(JSON.stringify(json));
//     }
// }

// export function whereContains(json, key, val) {
//     var formattedData = formatData(json);
//     debugger;
//     return where(formattedData, key, 'isContain', val);
// }

function recursivePropertySearch(obj, prop) {
    if (typeof obj === 'object' && obj !== null) {
        if (obj.hasOwnProperty(prop)) {
            return obj;
        }
        for (var p in obj) {
            console.log("p", p);
            console.log("object:", obj);
            if (obj.hasOwnProperty(p) &&
                recursivePropertySearch(obj[p], prop)) {
                return obj;
            }
        }
    }
    return false;
}

function rejectFalse(linkedComponent) {
    return linkedComponent !== false;
}

export function hasOwnDeepProperty(store, prop) {
    var linkedComponents = [];
    Object.keys(store).forEach(function (element) {
        linkedComponents.push(recursivePropertySearch(store[element], prop, []));
    });
    return linkedComponents.filter(rejectFalse);
}

export function filterTargetComponent(componentList, componentType) {
    var availableTargets = []; //Ideally would only be one... but need to handle for potentially many
    componentList.forEach(function (element) {
        if (!componentType) {
            if (element.active === true) {
                availableTargets.push(element);
            }
        }
        else {
            if (element.client.componentType === componentType && element.active === true) {
                availableTargets.push(element);
            }
        }
    });
    return availableTargets;
}