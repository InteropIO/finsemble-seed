// var isEqual = require('lodash.isequal');
const _ = require('lodash');
const Finsemble = require("@chartiq/finsemble");
const ConfigClient = Finsemble.Clients.ConfigClient;


//AppD Specification Helper Functions
function getAllFDC3Config() {
  return new Promise(function (resolve, reject) {
    ConfigClient.getValues([{ field: 'finsemble.components' }], function (err, values) {
      console.log("Component Config Values for FDC3", values);
      resolve(values);
    });
  })
}

function pickDeep(collection, predicate, thisArg) {
  if (_.isFunction(predicate)) {
    predicate = _.iteratee(predicate, thisArg);
  } else {
    var keys = _.flatten(_.tail(arguments));
    predicate = function (val, key) {
      return _.includes(keys, key);
    }
  }

  return _.transform(collection, function (memo, val, key) {
    var include = predicate(val, key);
    if (!include && _.isObject(val)) {
      val = pickDeep(val, predicate);
      include = !_.isEmpty(val);
    }
    if (include) {
      _.isArray(collection) ? memo.push(val) : memo[key] = val;
    }
  });
}

function getFDC3(componentConfigObject) {
  return componentConfigObject['foreign']['services']['fdc3'];
}

function flattenFDC3Config(deepPickResults) {
  var flattenedFDC3Config = [];
  let componentFDC3Configs = deepPickResults['finsemble.components'];
  console.log(componentFDC3Configs);
  Object.keys(componentFDC3Configs).forEach(function (k) {
    let fdc3 = getFDC3(componentFDC3Configs[k]);
    const appD = {
      name: k,
      fdc3: fdc3
    }
    let result = Object.create(appD);
    flattenedFDC3Config.push(result);
    console.log(appD);
  });
  return flattenedFDC3Config;
}



//App Intent Object Formatting

// var data = {
//   "rows": [{
//     "key": ["zeit.de"],
//     "value": 98
//   }, {
//     "key": ["google.com"],
//     "value": 49
//   }, {
//     "key": ["spiegel.de"],
//     "value": 20
//   }, {
//     "key": ["spiegel.de"],
//     "value": 12
//   }, {
//     "key": ["spiegel.de"],
//     "value": 20
//   }, {
//     "key": ["spiegel.de"],
//     "value": 12
//   }, {
//     "key": ["netmng.com"],
//     "value": 49
//   }, {
//     "key": ["zeit.de"],
//     "value": 300
//   }]
// };

// var merged = {
//   rows: []
// };

// data.rows.forEach(function(sourceRow) {
//   debugger;
//   if(!merged.rows.some(function(row) { return row.key[0] == sourceRow.key[0]; })) {
//     merged.rows.push({ key: [sourceRow.key[0]], value: sourceRow.value });
//   } else {
//     var targetRow = merged.rows.filter(function(targetRow) { return targetRow.key[0] == sourceRow.key[0] })[0];

//     targetRow.value += sourceRow.value;
//   }
// });

// document.getElementById("result").textContent = JSON.stringify(merged);

// ORRRRRRRRRRRRRRR

// var json = '{"rows":[{"key":["zeit.de"],"value":98},{"key":["google.com"],"value":49},{"key":["spiegel.de"],"value":20},{"key":["spiegel.de"],"value":12},{"key":["spiegel.de"],"value":20},{"key":["spiegel.de"],"value":12},{"key":["netmng.com"],"value":49},{"key":["zeit.de"],"value":300}]}';
// var obj = JSON.parse(json);

// var newObj = {};
// for(i in obj['rows']){
//  var item = obj['rows'][i];
//     if(newObj[item.key[0]] === undefined){
//         newObj[item.key[0]] = 0;
//     }
//     newObj[item.key[0]] += item.value;
// }

// var result = {};
// result.rows = [];
// for(i in newObj){
//     result.rows.push({'key':i,'value':newObj[i]});
// }
// console.log(result);


















//Find Intent Helper Functions
function formatAppIntentResponse(filteredResult) {
  var responseArray = [];
  var merged = {
    rows: []
  };
  // var intentDetails = {};
  var appIntentResponse;
  console.log(typeof filteredResult);
  filteredResult.forEach((intent) => {
    let intentName = intent['intent']['name'];
    let componentName = { name: intent['name'] };
    let intentDisplayName = intent['intent']['displayName'];
    //   if (!intentDetails.hasOwnProperty('name') || !intentDetails.hasOwnProperty('displayName')) {
    //     intentDetails = {
    //       name: intentName,
    //       displayName: intentDisplayName
    //     }
    //   }
    //   appArray.push(componentName);


    let appIntent = {
      intent: { name: intentName, displayName: intentDisplayName },
      apps: componentName
    }
    responseArray.push(appIntent);
  });
  // appIntentResponse = {
  //   intent: intentDetails,
  //   apps: appArray
  // }
  var mergedResult = [];
  for (var i = 0; i < responseArray.length; i++) {
    mergedResult = mergedResult.concat(responseArray[i]);
  }
  console.log("Merge Me", mergedResult);


  mergedResult.forEach(function (sourceRow) {
    var sourceRowKeys = Object.keys(sourceRow);
    var mergeId=0;
    console.log("Keys for src:", sourceRowKeys);
    // debugger;
    if (!merged.rows.some(function (row) { return _.isEqual(row[sourceRowKeys[0]], sourceRow[sourceRowKeys[0]]);})) {
      merged.rows.push(sourceRow);
    } else {
      var targetRow = merged.rows.filter(function (targetRow, index) { mergeId = index; return _.isEqual(targetRow[sourceRowKeys[0]], sourceRow[sourceRowKeys[0]]) });
      console.log("targetRow", mergeId);
      // merged.rows.
      // targetRow.value += sourceRow.value;
    }
  });

  console.log("Merged Result", merged);



  return appIntentResponse;
}

function customClientIntentResultFilter(results) {
  if (results) {
    return results;
  }
}

function findAllIntentMatches(fdc3Configuration, intent, context) {
  var results = [];
  fdc3Configuration.forEach(function (element) {
    let intents = element['fdc3']['intents'];
    let match = _.find(intents, _.matchesProperty('name', intent));
    if (match) {
      match = { intent: match, name: element["name"] };
      results.push(match);
    }
  })
  var filteredResult = customClientIntentResultFilter(results);
  var response = formatAppIntentResponse(filteredResult);
  return response;
}


//Find Intent By Context Helper Functions
function customClientContextResultFilter(results) {
  // if (results) {
  return results;
  // }
}

function findAllContextMatches(fdc3Configuration, context) {
  var results = [];
  fdc3Configuration.forEach(function (element) {
    let intentList = element['fdc3']['intents'];
    intentList.forEach(function (intent) {
      let fdc3Contexts = intent['contexts'];
      console.log(context);
      if (fdc3Contexts.includes(context)) {
        let match = { intent: intent, name: element["name"] };
        results.push(match);
      }
    });
  })
  console.log("Context Match Unfiltered Results:", results);
  var filteredResult = customClientContextResultFilter(results);
  var response = formatAppIntentResponse(filteredResult);
  return response;
}


//API Utilities
export function getAllComponentAppSpec() {
  return new Promise(function (resolve, reject) {
    let environmentIntents = getAllFDC3Config().then(function (value) {
      let test = pickDeep(value, 'fdc3');
      console.log(test);
      let flat = flattenFDC3Config(test);
      console.log("Flat:", flat);
      resolve(flat);
    });
  })
}

export function findAllIntentMatchesandFormatResponse(fdc3Configuration, intent, context) {
  let matches = findAllIntentMatches(fdc3Configuration, intent, context)
  console.log("MATCHES!", matches);
  return matches;
}

export function findAllContextMatchesandFormatResponse(fdc3Configuration, context) {
  let matches = findAllContextMatches(fdc3Configuration, context);
  return matches;
}