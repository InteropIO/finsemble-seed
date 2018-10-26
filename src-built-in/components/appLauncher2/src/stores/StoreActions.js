import { getStore } from './LauncherStore'

export default {
	addNewFolder,
	addAppToFolder,
	removeAppFromFolder,
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
		field: 'appFolders.folders',
		value: folders
	}, (error, data) => {
		if (error) {
			console.log('Failed to save modified folder list.')
		}
	})
}

function getFolders() {
	return getStore().getValue({
		field: 'appFolders'
	}).folders
}

function getFavoriteFolder() {
	return getFolders().find(folder => folder.name === 'Favorites')
}

function reorderFolders(destIndex, srcIndex) {
	const folders = getFolders()
	// Swap array elements
	const temp = folders[srcIndex]
	folders[srcIndex] = folders[destIndex]
	folders[destIndex] = temp
	_setFolders(folders)
}

function addNewFolder(name) {
	// Find folders that have a name of "New folder" or "New folder #"
	const folders = getFolders()
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

function removeAppFromFolder(folder, app) {
	const folders = getFolders()
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
	return getFolders().find((folder) => {
		return folder.name == getStore().getValue({ field: 'activeFolder' })
	})
}

function getSearchText() {
	return getStore().getValue({ field: 'filterText' })
}

function getSortBy() {
	return getStore().getValue({ field: 'sortBy' })
}

function getTags() {
	return getStore().getValue({ field: 'tags' }) || []
}

function getAllAppsTags() {
	let tags = []
	getFolders().forEach((folder) => {
		folder.appDefinitions.forEach((app) => {
			tags = tags.concat(app.tags)
		})
	})
	// return unique ones only
	return tags.filter((tag, index) => {
		return tags.indexOf(tag) === index
	})
}

function addTag(tag) {
	// Get current list of tags
	const tags = getTags()
	// Push new tag to list
	tags.indexOf(tag) < 0 && tags.push(tag)
	// Update tags in store
	return getStore().setValue({ field: 'tags', value: tags })
}

function deleteTag(tag) {
	// Get current list of tags
	const tags = getTags()
	// Push new tag to list
	tags.splice(tags.indexOf(tag), 1)
	// Update tags in store
	return getStore().setValue({ field: 'tags', value: tags })
}