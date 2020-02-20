/**
 * This file handles component displayname changes and cases where
 * components are no longer registered with finsemble.
 * Given an array of pins and a component list, it'll do the work for you.
 */
declare type Pin = {
	component?: string,
	fontIcon: string,
	icon: string,
	index: number,
	label: string,
	params: {
		addToWorkspace: Boolean,
		monitor: string | number
	}
	toolbarSection: string
	type: string
	uuid: string
}


/**
 * @todo handle dynamic component registration.
 * @export
 * @class PinManager
 */
export class PinManager {
	/**
	 * Converts the array of pins into an object where the key is the label
	 * of the pin
	 *
	 * @param {Pin[]} arr
	 * @returns any
	 */
	convertPinArrayToObject(arr: Pin[]): any {
		const obj: any = {};
		arr.forEach((el, i) => {
			if (el) {
				const key = el.label;
				obj[key] = el;
				obj[key].index = i;
			}
		});
		return obj;
	}

	/**
	 * Will rename the label of any component whose displayName changes between sessions.
	 *
	 * @param {*} componentList
	 * @param {Pin[]} pins
	 * @returns {Pin[]}
	 * @memberof PinManager
	 */
	handleNameChanges(componentList: any, pins: Pin[]): Pin[] {
		return pins.map((pin: Pin) => {
			if (typeof pin.component === "undefined") return pin;

			const componentConfig = componentList[pin.component];

			let label = componentConfig.component.type;
			if (componentConfig.component.displayName) {
				label = componentConfig.component.displayName;
			}

			if (pin.label !== label) {
				pin.label = label;
			}

			return pin;
		})
	}

	/**
	 * Returns a filtered list of pins where the members are valid, registered components (and
	 * workspaces, if they're in the array)
	 *
	 * @param {*} componentList
	 * @param {Pin[]} pins
	 * @returns {Pin[]}
	 * @memberof PinManager
	 */
	removePinsNotInComponentList(componentList: any, pins: Pin[]): Pin[] {
		return pins.filter((pin: Pin) => {
			if (typeof pin.component !== "undefined") {
				return pin.component in componentList;
			}
			return true;
		})
	}

}
