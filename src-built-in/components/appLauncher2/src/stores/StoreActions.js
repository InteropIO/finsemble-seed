import {getStore} from './LauncherStore'

export default {
	getFolders,
	getActiveFolder,
	getSearchText,
	getSortBy,
	getTags,
	deleteTag,
	addTag
}

function getFolders(){
	return getStore().getValue({
		field: 'appFolders'
	}).folders
}

function getActiveFolder() {
	return getStore().getValue({
		field: 'appFolders'
	}).folders.filter((folder) => {
		return folder.name == getStore().getValue({field: 'activeFolder'})
	})[0]
}

function getSearchText() {
	return getStore().getValue({field: 'filterText'})
}

function getSortBy() {
	return getStore().getValue({field: 'sortBy'})
}

function getTags() {
	return getStore().getValue({field: 'tags'}) || []
}

function addTag(tag) {
	// Get current list of tags
	const tags = getTags()
	// Push new tag to list
	tags.indexOf(tag) < 0 && tags.push(tag)
	// Update tags in store
	return getStore().setValue({field: 'tags', value: tags})
}

function deleteTag(tag) {
	// Get current list of tags
	const tags = getTags()
	// Push new tag to list
	tags.splice(tags.indexOf(tag), 1)
	// Update tags in store
	return getStore().setValue({field: 'tags', value: tags})
}