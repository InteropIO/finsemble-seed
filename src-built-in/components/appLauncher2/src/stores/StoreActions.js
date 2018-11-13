import { getStore } from './LauncherStore'

let ToolbarStore;

export default {
	initialize,
	addNewFolder,
	addAppToFolder,
	removeAppFromFolder,
	renameFolder,
	deleteFolder,
	deleteTag,
	reorderFolders,
	getFolders,
	getFoldersList,
	getActiveFolderName,
	getActiveFolder,
	getSingleFolder,
	getAllAppsTags,
	getAllApps,
	getSearchText,
	getSortBy,
	addTag,
	getTags,
	addPin,
	removePin
}

const MY_APPS = 'My Apps'
const data = {}

function initialize(callback) {
	const store = getStore()
	data.folders = store.values.appFolders.folders
	data.foldersList = store.values.appFolders.list
	data.apps = store.values.appDefinitions
	data.tags = store.values.tags
	data.activeFolder = store.values.activeFolder
	data.filterText = store.values.filterText
	data.sortBy = store.values.sortBy

	// Add listeners to keep our copy up to date
	store.addListener({ field: 'appFolders.folders' }, (err, dt) => data.folders = dt.value)
	store.addListener({ field: 'appFolders.list' }, (err, dt) => data.foldersList = dt.value)
	store.addListener({ field: 'appDefinitions' }, (err, dt) => data.apps = dt.value)
	store.addListener({ field: 'activeFolder' }, (err, dt) => data.activeFolder = dt.value)
	store.addListener({ field: 'sortBy' }, (err, dt) => data.sortBy = dt.value)
	store.addListener({ field: 'tags' }, (err, dt) => data.tags = dt.value)
	getToolbarStore(callback || Function.prototype);
}

function getToolbarStore(done) {
	FSBL.Clients.DistributedStoreClient.getStore({ global: true, store: "Finsemble-Toolbar-Store" }, function (err, store) {
		ToolbarStore = store;
		store.getValue({ field: "pins" }, function (err, pins) {
			data.pins = pins;
		});

		store.addListener({ field: "pins" }, function (err, pins) {
			data.pins = pins;
		});
		done();
	});
}

function _setFolders(cb = Function.prototype) {
	getStore().setValue({
		field: 'appFolders.folders',
		value: data.folders
	}, (error, data) => {
		if (error) {
			console.log('Failed to save modified folder list.')
		} else {
			cb()
		}
	})
}

function _setValue(field, value) {
	getStore().setValue({
		field: field,
		value: value
	}, (error, data) => {
		if (error) {
			console.log('Failed to save. ', field)
		}
	})
}

function addPin(pin) {
	//TODO: This logic may not work for dashboards. Might need to revisit.
	FSBL.Clients.LauncherClient.getComponentList((err, components) => {
		let componentToToggle;
		for (let i = 0; i < Object.keys(components).length; i++) {
			let componentName = Object.keys(components)[i];
			if (componentName === pin.name) {
				componentToToggle = components[componentName];
			}
		}

		if (componentToToggle) {
			let componentType = componentToToggle.group || componentToToggle.component.type;
			let fontIcon;
			try {
				if (componentToToggle.group) {
					fontIcon = 'ff-ungrid';
				} else {
					fontIcon = componentToToggle.foreign.components.Toolbar.iconClass;
				}
			} catch (e) {
				fontIcon = "";
			}

			let imageIcon;
			try {
				imageIcon = componentToToggle.foreign.components.Toolbar.iconURL;
			} catch (e) {
				imageIcon = "";
			}


			let params = { addToWorkspace: true, monitor: "mine" };
			if (componentToToggle.component && componentToToggle.component.windowGroup) params.groupName = componentToToggle.component.windowGroup;
			var thePin = {
				type: "componentLauncher",
				label: pin.name,
				component: componentToToggle.group ? componentToToggle.list : componentType,
				fontIcon: fontIcon,
				icon: imageIcon,
				toolbarSection: "center",
				uuid: uuidv4(),
				params: params
			};
			ToolbarStore.setValue({ field: 'pins.' + pin.name.replace(/[.]/g, "^DOT^"), value: thePin });
		}
	});
}

function removePin(pin) {
	ToolbarStore.removeValue({ field: 'pins.' + pin.name.replace(/[.]/g, "^DOT^") });
}

function getFolders() {
	return data.folders
}

function getFoldersList(){
	return data.foldersList
}

function getAllApps() {
	return data.apps
}

function getSingleFolder(folderName) {
	return data.folders[folderName]
}

function reorderFolders(destIndex, srcIndex) {
	const movedFolder = data.foldersList[destIndex]
    const remainingItems = data.foldersList.filter((item, index) => index !== destIndex)
    data.foldersList = [
        ...remainingItems.slice(0, srcIndex),
        movedFolder,
        ...remainingItems.slice(srcIndex)
    ]
	_setValue('appFolders.list', data.foldersList)
	return data.foldersList
}

function addNewFolder(name) {
	// Each new folder is given a number, lets store them here
	// to get the highest one and then increment
	const newFoldersNums = [0]
	// Find folders that have a name of "New folder" or "New folder #"
	data.foldersList.forEach((folder) => {
		const numbers = folder.match(/\d+/g) || []
		newFoldersNums.push( Math.max.apply(this, numbers) )
	})
	const highestFolderNumber = Math.max.apply(this, newFoldersNums)
	const folderName = name || `New folder ${highestFolderNumber + 1}`
	const newFolder = {
		disableUserRemove: true,
		icon: "ff-folder",
		apps: []
	}
	data.folders[folderName] = newFolder
	_setFolders( () => {
		// Update folders order if adding was successful
		data.foldersList.push(folderName)
		_setValue('appFolders.list', data.foldersList)
	})

}

function deleteFolder(folderName) {
	// Check if user is trying to delete the active folder
	if(folderName === data.activeFolder) {
		data.activeFolder = MY_APPS
		_setValue('activeFolder', data.activeFolder)
	}

	delete data.folders[folderName] && _setFolders(() => {
		// Update the order of folders
		const index = data.foldersList.indexOf(folderName)
		data.foldersList.splice(index, 1)
		_setValue('appFolders.list', data.foldersList)
	})
}

function renameFolder(oldName, newName) {
	let oldFolder = data.folders[oldName]
	data.folders[newName] = oldFolder
	_setFolders(() => {
		let indexOfOld = data.foldersList.findIndex((folderName) => {
			return folderName === oldName
		})
		data.foldersList[indexOfOld] = newName
		_setValue('appFolders.list', data.foldersList)
		delete data.folders[oldName]
	});
}

function addAppToFolder(folderName, app) {
	data.folders[folderName].apps[app.appID] = {
		name: app.name,
		appID: app.appID
	}
	_setFolders()
}

function removeAppFromFolder(folderName, app) {
	delete data.folders[folderName].apps[app.appID];
	_setFolders()
}

function getActiveFolder() {
	const folder = data.folders[data.activeFolder]
	Object.values(folder.apps).map((app) => {
		app.tags = data.apps[app.appID].tags
	});
	//Need a name for the AppDefinition/AppActionsMenu rendering
	folder.name = data.activeFolder;
	return folder
}

function getActiveFolderName() {
	return data.activeFolder
}

function getSearchText() {
	return data.filterText
}

function getSortBy() {
	return data.sortBy
}

function getTags() {
	return data.tags
}

function getAllAppsTags() {
	let tags = []
	Object.values(data.apps).forEach((app) => {
		tags = tags.concat(app.tags)
	})
	// return unique ones only
	return tags.filter((tag, index) => {
		return tags.indexOf(tag) === index
	})
}

function addTag(tag) {
	// Push new tag to list
	data.tags.indexOf(tag) < 0 && data.tags.push(tag)
	// Update tags in store
	getStore().setValue({ field: 'tags', value: data.tags })
}

function deleteTag(tag) {
	// Push new tag to list
	data.tags.splice(data.tags.indexOf(tag), 1)
	// Update tags in store
	getStore().setValue({ field: 'tags', value: data.tags })
}

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c === 'x' ? r : r & 0x3 | 0x8;
		return v.toString(16);
	});
}