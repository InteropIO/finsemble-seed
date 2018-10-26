import React from 'react'
import AppDefinition from './AppDefinition'
import NoAppsFound from './NoAppsFound'
import FilterSort from './FilterSort'
import { getStore } from '../stores/LauncherStore'
import storeActions from '../stores/StoreActions'
import sortFunctions from '../utils/sort-functions'

// To be assigned a value later in the constructor
let store

export default class Content extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			tags: storeActions.getTags(),
			sortBy: storeActions.getSortBy(),
			filterText: storeActions.getSearchText(),
			folder: storeActions.getActiveFolder()
		}
		this.onSort = this.onSort.bind(this)
		this.onSearch = this.onSearch.bind(this)
		this.onTagsUpdate = this.onTagsUpdate.bind(this)
		this.onActiveFolderChanged = this.onActiveFolderChanged.bind(this)
		this.onAppListUpdate = this.onAppListUpdate.bind(this)
		store = getStore()
	}

	filterApps() {
		const sortFunc = sortFunctions[this.state.sortBy]
		const apps = this.filterAppsByTags(sortFunc(this.state.folder.appDefinitions))
		if (!this.state.filterText) {
			return apps
		}
		return apps.filter((app) => {
			return app.name.toLowerCase().indexOf(this.state.filterText) !== -1 ||
				app.friendlyName.toLowerCase().indexOf(this.state.filterText) !== -1
		})
	}

	filterAppsByTags(apps) {
		if (!this.state.tags.length) {
			return apps
		}
		return apps.filter((app) => {
			const regex = new RegExp(this.state.tags.join('|'))
			const result = app.tags.join(' ').match(regex)
			return result
		})
	}

	onActiveFolderChanged(error, data) {
		this.setState({
			folder: storeActions.getActiveFolder()
		})
	}

	onSearch(error, data) {
		this.setState({
			filterText: storeActions.getSearchText()
		})
	}

	onSort(error, data) {
		this.setState({
			sortBy: data.value
		})
	}

	onTagsUpdate(error, data) {
		this.setState({
			tags: data.value
		})
	}
	/**
	 * Mainly used to know when a user remove an app from a folder
	 * Because there is no way to subscribe to 
	 * folders[index].appDefinitions updates.
	 */
	onAppListUpdate() {
		this.setState({
			folder: storeActions.getActiveFolder()
		})
	}

	componentWillMount() {
		store.addListener({ field: 'activeFolder' }, this.onActiveFolderChanged)
		store.addListener({ field: 'filterText' }, this.onSearch)
		store.addListener({ field: 'sortBy' }, this.onSort)
		store.addListener({ field: 'tags' }, this.onTagsUpdate)
		// We can't subscribe to folders[index].appDefinitions
		// So we are looking at appFolders.folders update 
		// Since that update is done After removing an app of definitions
		store.addListener({ field: 'appFolders.folders' }, this.onAppListUpdate)
	}

	componentWillUnmount() {
		store.removeListener({ field: 'activeFolder' }, this.onActiveFolderChanged)
		store.removeListener({ field: 'filterText' }, this.onSearch)
		store.removeListener({ field: 'sortBy' }, this.onSort)
		store.removeListener({ field: 'tags' }, this.onTagsUpdate)
		store.removeListener({ field: 'appFolders.folders' }, this.onAppListUpdate)
	}

	renderAppList() {
		return this.filterApps().map((app, index) => {
			return <AppDefinition app={app} key={index}></AppDefinition>
		})
	}

	getNoResultsMessage() {
		const messages = {
			search: 'No results found. Please try again.',
			Favorites: ['There’s nothing here!', <br />, 'Add apps and dashboards to Favorites to view them here.'],
			Dashboards: ['There’s nothing here!', <br />, 'Press “New Dashboard” to construct an Dashboard.'],
			default: ['There’s nothing here!', <br />,  'Add apps to folders to view them here.']
		}
		// User is searching so we need the search message
		if (this.state.filterText) return messages.search
		// Now let's check which folder is currently active
		switch (this.state.folder.name) {
			case 'Favorites':
				return messages.Favorites
				break
			case 'Dashboards':
				return messages.Dashboards
			default:
				return messages.default
		}
	}

	render() {
		const apps = this.renderAppList()
		return (
			<div className="complex-menu-content-row">
				<FilterSort></FilterSort>
				{apps.length ? apps : <NoAppsFound message={this.getNoResultsMessage()} />}
			</div>
		)
	}

}