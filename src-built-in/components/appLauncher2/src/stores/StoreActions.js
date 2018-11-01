import { getStore } from './LauncherStore'

export default {
	getValue,
	addNewFolder,
	addAppToFolder,
	removeAppFromFolder,
	renameFolder,
	deleteFolder,
	deleteTag,
	reorderFolders,
	getFolders,
	getActiveFolder,
	getFavoriteFolder,
	getAllAppsTags,
	getSearchText,
	getSortBy,
	addTag,
	getTags
}

function _setFolders(folders) {
	getStore().setValue({
		field: 'folders',
		value: folders
	}, (error, data) => {
		if (error) {
			console.log('Failed to save modified folder list.')
		}
	})
}
/**
 * A wrapper for StoreModel.getValue to return a promise
 * instead of callback to take advantage of the async/await syntax
 * @param {string} field The field we want to get its value
 */
function getValue(field) {
	return new Promise((resolve, reject) => {
		getStore().getValue({field: field}, (error, data) => {
			if(!error) {
				resolve(data)
			} else {
				reject(error)
			}

		})
	})
}

function getFolders() {
	return getValue('folders')
}

function getFavoriteFolder() {
	return new Promise(async (resolve, reject) => {
		const folders = await getFolders()
		resolve(folders.find(folder => folder.name === 'Favorites'))
	})
}

async function reorderFolders(destIndex, srcIndex) {
	const folders = await getFolders()
	// Swap array elements
	const temp = folders[srcIndex]
	folders[srcIndex] = folders[destIndex]
	folders[destIndex] = temp
	_setFolders(folders)
}

async function addNewFolder(name) {
	console.log('adding a folder asyncrounously');
	// Find folders that have a name of "New folder" or "New folder #"
	const folders = await getFolders()
	const newFolders = folders.filter((folder) => {
		return folder.name.toLowerCase().indexOf('new folder') > -1
	})
	const newFolder = {
		name: name || `New folder ${newFolders.length + 1}`,
		type: 'folder',
		disableUserRemove: true,
		icon: "ff-folder",
		appDefinitions: []
	}
	folders.push(newFolder)
	_setFolders(folders)
	return newFolder
}

async function deleteFolder(name) {
	const folders = await getFolders();
	const newFolders = folders.filter((folder) => {
		if (folder.name !== name) return true;
	});
	_setFolders(newFolders);
}

async function renameFolder(oldName, newName) {
	const folders = await getFolders();
	let targetFolder;
	const newFolders = folders.map((folder) => {
		if (folder.name === oldName) {
			folder.name = newName;
			targetFolder = folder;
		}
		return folder;
	});
	_setFolders(newFolders);
	getStore().setValue({
		field: 'activeFolder',
		value: newName
	});
}

function addAppToFolder(folder, app) {
	const folders = getFolders()
	const index = folders.findIndex((item) => {
		return item.name === folder.name
	})
	// Add app to folder & make sure its added once
	const apps = folders[index].appDefinitions
	const foundApp = apps.find((item) => {
		return item.name === app.name
	})

	if (!foundApp) {
		apps.push(app)
		_setFolders(folders)
	}
}

async function removeAppFromFolder(folder, app) {
	const folders = await getFolders()
	const folderIndex = folders.findIndex((item) => {
		return item.name === folder.name
	})
	const apps = folders[folderIndex].appDefinitions
	const appIndex = apps.findIndex((item) => {
		return item.name === app.name
	})
	// Remove app from apps in folder & Update folders
	apps.splice(appIndex, 1) && _setFolders(folders)
}

function getActiveFolder() {
	return new Promise(async (resolve, reject) => {
		const folders = await getFolders()
		const activeFolder = await getValue('activeFolder')
		const folder = folders.find((folder) => {
			return folder.name == activeFolder
		})
		resolve(folder)
	})
}

function getSearchText() {
	return getValue('filterText')
}

function getSortBy() {
	return getValue('sortBy')
}

function getTags() {
	return getValue('tags')
}

function getAllAppsTags() {
	return new Promise(async (resolve, reject) => {
		let tags = []
		const folders = await getFolders()
		folders.forEach((folder) => {
			folder.appDefinitions.forEach((app) => {
				tags = tags.concat(app.tags)
			})
		})
		// return unique ones only
		tags = tags.filter((tag, index) => {
			return tags.indexOf(tag) === index
		})
		resolve(tags)
	})
}

async function addTag(tag) {
	// Get current list of tags
	const tags = await getTags()
	// Push new tag to list
	tags.indexOf(tag) < 0 && tags.push(tag)
	// Update tags in store
	getStore().setValue({ field: 'tags', value: tags })
}

async function deleteTag(tag) {
	// Get current list of tags
	const tags = await getTags()
	// Push new tag to list
	tags.splice(tags.indexOf(tag), 1)
	// Update tags in store
	getStore().setValue({ field: 'tags', value: tags })
}