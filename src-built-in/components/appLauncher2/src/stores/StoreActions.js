import { getStore } from './LauncherStore'

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
	getActiveFolderName,
	getActiveFolder,
	getSingleFolder,
	getAllAppsTags,
	getAllApps,
	getSearchText,
	getSortBy,
	addTag,
	getTags
}

const data = {}

function initialize(callback) {
	const store = getStore()
	data.folders = store.values.appFolders.folders
	data.apps = store.values.appDefinitions
	data.tags = store.values.tags
	data.activeFolder = store.values.activeFolder
	data.filterText = store.values.filterText
	data.sortBy = store.values.sortBy

	// Add listeners to keep our copy up to date
	store.addListener({ field: 'appFolders.folders' }, (err, dt) => data.folders = dt.value)
	store.addListener({ field: 'appDefinitions' }, (err, dt) => data.apps = dt.value)
	store.addListener({ field: 'activeFolder' }, (err, dt) => data.activeFolder = dt.value)
	store.addListener({ field: 'sortBy' }, (err, dt) => data.sortBy = dt.value)
	store.addListener({ field: 'tags' }, (err, dt) => data.tags = dt.value)
	callback && callback()
}

function _setFolders(folders) {
	getStore().setValue({
		field: 'appFolders.folders',
		value: data.folders
	}, (error, data) => {
		if (error) {
			console.log('Failed to save modified folder list.')
		}
	})
}

function getFolders() {
	return data.folders
}

function getAllApps() {
	return data.apps
}

function getSingleFolder(folderName) {
	return data.folders[folderName]
}

function reorderFolders(src, dest) {
	console.log('data.folders: ', data.folders);
	let srcFolder = data.folders[src];
	let destFolder = data.folders[dest];

	_setFolders();
}

function addNewFolder(name) {
	console.log('adding a folder asyncrounously');
	// Find folders that have a name of "New folder" or "New folder #"
	const newFolders = Object.keys(data.folders).filter((folder) => {
		return folder.toLowerCase().indexOf('new folder') > -1
	})
	const folderName = name || `New folder ${newFolders.length + 1}`
	const newFolder = {
		disableUserRemove: true,
		icon: "ff-folder",
		apps: []
	}
	data.folders[folderName] = newFolder
	_setFolders()
}

function deleteFolder(folderName) {
	delete data.folders[folderName] && _setFolders()
}

function renameFolder(oldName, newName) {
	data.folders[newName] = data.folders[oldName]
	delete data.folders[oldName]
	_setFolders()
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
	})
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