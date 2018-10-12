import {getStore} from './LauncherStore'

const actions = {
	getFolders: () => {
		return getStore().getValue({
			field: 'appFolders'
		}).folders
	},
	getActiveFolder: () => {
		return getStore().getValue({
			field: 'appFolders'
		}).folders.filter((folder) => {
			return folder.name == getStore().getValue({field: 'activeFolder'})
		})[0]
	},
	getSearchText: () => {
		return getStore().getValue({field: 'filterText'})
	}
}

export default actions