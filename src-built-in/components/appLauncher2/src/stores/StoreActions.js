import { getStore } from './LauncherStore'

export default {
	addNewFolder,
	addAppToFolder,
	addTag,
	deleteTag,
	reorderFolders,
	getFolders,
	getActiveFolder,
	getSearchText,
	getSortBy,
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

function reorderFolders(destIndex, srcIndex) {
	const store = getStore()
	const folders = store.getValue({ field: 'appFolders.folders' })
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
		name: name || `New folder ${newFolders.length+1}`,
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
	const store = getStore()
	const folders = store.getValue({ field: 'appFolders.folders' })
	const index = folders.findIndex((item) => {
		return item.name === folder.name
	})
	// Add app to folder
	folders[index].appDefinitions.push(app)
	// Update folders in store
	_setFolders(folders)
}


function getActiveFolder() {
	return getStore().getValue({
		field: 'appFolders'
	}).folders.filter((folder) => {
		return folder.name == getStore().getValue({ field: 'activeFolder' })
	})[0]
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