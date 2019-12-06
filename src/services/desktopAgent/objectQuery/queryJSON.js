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
	for (let [key, value] of Object.entries(componentList)){
		if(value.componentType === componentType) {
			availableTargets.push(key);
		}
	}
	return availableTargets;
}