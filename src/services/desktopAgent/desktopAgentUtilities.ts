import FDC3 from "../../../src-built-in/components/advancedAppCatalog/src/modules/FDC3";

const _ = require('lodash');
// const Finsemble = require("@chartiq/finsemble");
// const ConfigClient = Finsemble.Clients.ConfigClient;

//AppD Specification Helper Functions
async function getAllFDC3Config(ConfigClient: any) {
	const { data: config } = await ConfigClient.getValue({ field: 'finsemble.components' });
	return config;
}

let predicate;
function pickDeep(collection: any, predicate: any, thisArg?: any) {
	if (_.isFunction(predicate)) {
		predicate = _.iteratee(predicate, thisArg);
	} else {
		let keys = _.flatten(_.tail(arguments));
		predicate = function (val: any, key: any) {
			return _.includes(keys, key);
		}
	}

	return _.transform(collection, function (memo: any, val: any, key: any) {
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

function getFDC3(componentConfigObject: any) {
	return componentConfigObject['foreign']['services']['fdc3'];
}

function flattenFDC3Config(componentFDC3Configs: any) {
	console.log(componentFDC3Configs);
	const flattenedFDC3Config: any[] = [];
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
function formatAppIntentResponse(filteredResult: any) {
	const intentArray: any[] = [];
	const merged: any = {
		rows: []
	};
	let responseArray = [];

	filteredResult.forEach((intent: any) => {
		let intentName = intent['intent']['name'];
		let componentName = { name: intent['name'] };
		let intentDisplayName = intent['intent']['displayName'];
		let appIntent = {
			intent: { name: intentName, displayName: intentDisplayName },
			apps: componentName
		}
		intentArray.push(appIntent);
	});

	let mergedResult: any[] = [];
	for (let i = 0; i < intentArray.length; i++) {
		mergedResult = mergedResult.concat(intentArray[i]);
	}

	for (const sourceRow of mergedResult) {
		let mergeId = -1;
		if (!merged.rows.some((row: any) => { return _.isEqual(row['intent'], sourceRow['intent']); })) {
			merged.rows.push(sourceRow);
		} else {
			merged.rows.filter((targetRow: any, index: number) => {
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
	};

	responseArray = merged.rows;
	return responseArray;
}

//Find Intent Helper Functions
function customClientIntentResultFilter(results: any) {
	if (results) {
		return results;
	}
}

//Find Intent By Context Helper Functions
function customClientContextResultFilter(results: any) {
	return results;
}

function findAllContextMatches(fdc3Configuration: any, context: Context) {
	var results: any = [];
	fdc3Configuration.forEach(function (element: any) {
		let intentList = element['fdc3']['intents'];
		intentList.forEach(function (intent: any) {
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
export async function getAllComponentAppSpec(ConfigClient: any) {
	let environmentIntents = await getAllFDC3Config(ConfigClient)
	let test = pickDeep(environmentIntents, 'fdc3');
	console.log(test);
	let flat = flattenFDC3Config(test);
	console.log("Flat:", flat);
	return flat;
}

export function findAllIntentMatchesandFormatResponse(fdc3Configuration: any, intent: any, context: Context) {
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

export function findAllContextMatchesandFormatResponse(fdc3Configuration: any, context: Context) {
	let matches = findAllContextMatches(fdc3Configuration, context);
	return matches;
}

export function resolveIntent(intent: any, intentComponentList: any[], activeComponents: any[], context: Context) {
	let index = 0;
	let activeMatches = [];
	console.log(intentComponentList);
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