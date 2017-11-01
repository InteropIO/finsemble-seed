/**
 *
 * This file handles common functionality needed in both the client and service.
 *
 */
// Get a value from an object using a string. {abc:{123:"value"}} you would do byString(object,"abc.123")
function byString(o, s) {//Object,String
	s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
	s = s.replace(/^\./, '');           // strip a leading dot
	var a = s.split('.');
	for (var i = 0, n = a.length; i < a.length; ++i) {// Loop through and find the attribute that matches the string passed in
		var k = a[i];
		if (!o) { return null; }
		if (k in o) {
			o = o[k];
		} else {
			return null;
		}
	}
	return o;
};
//can add values to an object from a string. Must be in `.` form abc.123
const setPath = (object, path, value) => path
	.split('.')
	.reduce((o, p) => o[p] = path.split('.').pop() === p ? value : o[p] || {}, object);

// This handles the intial mapping for us. It will crawl through all child objects and map those too. Parent is the current location within the object(`parent.child`). Null is top level. The mapping is all flattened
function initObject(object, parent, mapping) {
	var mapLocation;

	if (!parent) { parent = null; }

	if (typeof object !== "object") {
		mapLocation = parent ? parent + "." + n : n;
		mapping[mapLocation] = parent;
		return;
	}

	for (n in object) {
		if (typeof object[n] === "object" && object[n] !== "undefined") {
			mapLocation = parent ? parent + "." + n : n;
			mapping[mapLocation] = parent;
			initObject(object[n], mapLocation, mapping);// If we have another object, map it
		} else {
			mapLocation = parent ? parent + "." + n : n;
			mapping[mapLocation] = parent;
		}
	}
}
// Will map out a field in an object. So we don't have to loop through the whole thing everytime we have a change.
function mapField(object, s, mapping) {
	if (mapping[s]) { return; }// If we're already mapped move on.
	s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
	s = s.replace(/^\./, '');           // strip a leading dot
	var a = s.split('.');
	var currentLocation = s;
	if (!mapping.hasOwnProperty(currentLocation)) {
		var newString = null;
		if (a.length > 1) {
			a.pop();
			newString = a.join(".");
		}

		mapping[currentLocation] = newString;
	}

	var newObject = byString(object, currentLocation);
	if (newObject === "undefined") { return; }// If the location doesnt exist exit.
	if (typeof newObject === "object") {
		for (var key in newObject) {
			mapField(object, currentLocation + "." + key, mapping);// If we need to ke
		}
	}
}
// To see if we're replacing an existing field/object with an object/field that would make some of the mapping obsolete.
function checkForObjectChange(object, field, mapping) {
	var objectReplacing = byString(object, field);
	if (objectReplacing === null) { return false; }
	if (typeof objectReplacing === "object") {
		// we're replacing an object which requires use to remapp at this level.
		return removeChildMapping(mapping, field);

	}
	if (typeof objectReplacing !== "object" && typeof field === "object") {
		//we're replacing a non object with an object. Need to map out this new object
		return removeChildMapping(mapping, field);
	}
	return null;
}
//This will remove an item from mapping and pass back an array so that we can send out notifications
function removeChildMapping(mapping, field) {
	var removals = [];
	for (var map in mapping) {
		var lookField = field + ".";
		if (map.includes(lookField)) {
			removals.push(map);
			delete mapping[map];
		};
	}
	return removals;
}

module.exports = {
	setPath: setPath,
	byString: byString,
	initObject: initObject,
	mapField: mapField,
	checkForObjectChange: checkForObjectChange
};