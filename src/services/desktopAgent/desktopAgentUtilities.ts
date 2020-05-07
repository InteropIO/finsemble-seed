const _ = require('lodash');
// const Finsemble = require("@chartiq/finsemble");
// const ConfigClient = Finsemble.Clients.ConfigClient;

//AppD Specification Helper Functions
async function getAllFDC3Config(ConfigClient) {
	const { data: config } = await ConfigClient.getValue({ field: 'finsemble.components' });
	return config;
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

function flattenFDC3Config(componentFDC3Configs) {
	console.log(componentFDC3Configs);
	const flattenedFDC3Config = []
	Object.keys(componentFDC3Configs).forEach(function (k) {
		let fdc3 = getFDC3(componentFDC3Configs[k]);
		const appD = {
			name: k,
			fdc3: fdc3
		}
		//let result = Object.create(appD);
		flattenedFDC3Config.push(appD);
		console.log(appD);
	});
	return flattenedFDC3Config;
}


//App Intent Object Formatting
function formatAppIntentResponse(filteredResult) {
	var intentArray = [];
	var merged = {
		rows: []
	};
	var responseArray = [];

	filteredResult.forEach((intent) => {
		let intentName = intent['intent']['name'];
		let componentName = { name: intent['name'] };
		let intentDisplayName = intent['intent']['displayName'];
		let appIntent = {
			intent: { name: intentName, displayName: intentDisplayName },
			apps: componentName
		}
		intentArray.push(appIntent);
	});
	var mergedResult = [];
	for (var i = 0; i < intentArray.length; i++) {
		mergedResult = mergedResult.concat(intentArray[i]);
	}

	mergedResult.forEach(function (sourceRow) {
		var mergeId = -1;
		if (!merged.rows.some(function (row) { return _.isEqual(row['intent'], sourceRow['intent']); })) {
			merged.rows.push(sourceRow);
		} else {
			merged.rows.filter(function (targetRow, index) {
				if (_.isEqual(targetRow['intent'], sourceRow['intent'])) {
					mergeId = index;
					return sourceRow['intent']
				}

			});
			if (!(mergeId === -1)) {
				merged.rows[mergeId].apps = [merged.rows[mergeId].apps, sourceRow['apps']];
				mergeId = -1;
			}
		}
	});

	responseArray = merged.rows;
	return responseArray;
}

//Find Intent Helper Functions
function customClientIntentResultFilter(results) {
	if (results) {
		return results;
	}
}

//Find Intent By Context Helper Functions
function customClientContextResultFilter(results) {
	return results;
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
export async function getAllComponentAppSpec(ConfigClient) {
	let environmentIntents = await getAllFDC3Config(ConfigClient)
	let test = pickDeep(environmentIntents, 'fdc3');
	console.log(test);
	let flat = flattenFDC3Config(test);
	console.log("Flat:", flat);
	return flat;
}

export function findAllIntentMatchesandFormatResponse(fdc3Configuration, intent, context) {
	const results = [];
	for (const element of fdc3Configuration) {
		let intents = element['fdc3']['intents'];
		let match = _.find(intents, _.matchesProperty('name', intent));
		if (match) {
			results.push(element["name"]);
		}
	}
	//const filteredResult = customClientIntentResultFilter(results);
	//const response = formatAppIntentResponse(filteredResult);
	console.log("Matches", results);
	return results;
}

export function findAllContextMatchesandFormatResponse(fdc3Configuration, context) {
	let matches = findAllContextMatches(fdc3Configuration, context);
	return matches;
}

export function resolveIntent(intent, intentComponentList, activeComponents, context) {
	let index = 0;
	let activeMatches = [];
	console.log(intentList);
	let activeIds = Object.keys(activeComponents);

	console.log(intentComponentList);
	for (const component of Object.values(activeComponents)) {
		console.log(component.componentType);
		if (intentComponentList.includes(component.componentType)) {
			let match = {
				"windowIdentifier": activeIds[index],
				"componentType": component.componentType
			};
			activeMatches.push(match);
			console.log("Match Registered");
		}
		index = index + 1;
	}

	console.log("Matches:", activeMatches);

	// If there is an intent listening component online, then publish, otherwise spawn
	if (activeMatches.length) {

	}

	debugger;
	// let windowID = Finsemble.Clients.WindowClient.getWindowIdentifier();
	var data = {
		componentList: activeMatches
		// windowID: windowID
	}
	var options = {
		data: data,
		ephemeral: true,
		slave: false
	}
	// Only one dialogWindow instance allowed at a time
	// if (this.dialogWindow) {
	// 	Finsemble.Clients.RouterClient.transmit("Close_dialog", true);
	// }
	// this.dialogWindow =
	// Finsemble.Clients.LauncherClient.spawn("Intent Resolver", options);
	// debugger;
	// return activeMatches;

}

export default {
	getAllComponentAppSpec,
	findAllIntentMatchesandFormatResponse,
	findAllContextMatchesandFormatResponse,
	resolveIntent
}