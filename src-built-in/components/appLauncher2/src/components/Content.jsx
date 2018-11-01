import React from 'react'
import AppDefinition from './AppDefinition'
import NoAppsFound from './NoAppsFound'
import FilterSort from './FilterSort'
import { getStore } from '../stores/LauncherStore'
import storeActions from '../stores/StoreActions'
import sortFunctions from '../utils/sort-functions'

window.storeActions = storeActions
// To be assigned a value later in the constructor
let store

export default class Content extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			tags: [],
			sortBy: 'Alphabetical',
			filterText: '',
			folder: {appDefinitions: []}
		}
		this.onSort = this.onSort.bind(this)
		this.onSearch = this.onSearch.bind(this)
		this.onTagsUpdate = this.onTagsUpdate.bind(this)
		this.onActiveFolderChanged = this.onActiveFolderChanged.bind(this)
		this.onAppListUpdate = this.onAppListUpdate.bind(this)
		store = getStore()
	}

	async setStateValues() {
		this.setState({
			tags: await storeActions.getTags(),
			sortBy: await storeActions.getSortBy(),
			filterText: await storeActions.getSearchText(),
			folder: await storeActions.getActiveFolder()
		})
	}

	filterApps() {
		const folder = this.state.folder
		if(!folder.appDefinitions) {
			return []
		}
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
		if (!this.state.tags) {
			return apps
		}
		return apps.filter((app) => {
			const regex = new RegExp(this.state.tags.join('|'))
			const result = app.tags.join(' ').match(regex)
			return result
		})
	}

	async onActiveFolderChanged(error, data) {
		this.setState({
			folder: await storeActions.getActiveFolder()
		})
	}

	async onSearch(error, data) {
		this.setState({
			filterText: await storeActions.getSearchText()
		})
	}

	onSort(error, data) {
		this.setState({
			sortBy: data.value
		})
	}

	async onTagsUpdate(error, data) {
		this.setState({
			tags: data.value
		})
	}
	/**
	 * Mainly used to know when a user remove an app from a folder
	 * Because there is no way to subscribe to
	 * folders[index].appDefinitions updates.
	 */
	async onAppListUpdate(error, data) {
		this.setState({
			folder: await storeActions.getActiveFolder()
		})
	}

	componentDidMount() {
		this.setStateValues()
	}

	componentWillMount() {
		store.addListener({ field: 'activeFolder' }, this.onActiveFolderChanged)
		store.addListener({ field: 'filterText' }, this.onSearch)
		store.addListener({ field: 'sortBy' }, this.onSort)
		store.addListener({ field: 'tags' }, this.onTagsUpdate)
		// We can't subscribe to folders[index].appDefinitions
		// So we are looking at appFolders.folders update
		// Since that update is done After removing an app of definitions
		store.addListener({ field: 'folders' }, this.onAppListUpdate)
	}

	componentWillUnmount() {
		store.removeListener({ field: 'activeFolder' }, this.onActiveFolderChanged)
		store.removeListener({ field: 'filterText' }, this.onSearch)
		store.removeListener({ field: 'sortBy' }, this.onSort)
		store.removeListener({ field: 'tags' }, this.onTagsUpdate)
		store.removeListener({ field: 'folders' }, this.onAppListUpdate)
	}

	renderAppList() {
		return this.filterApps().map((app, index) => {
			return <AppDefinition app={app} folder={this.state.folder} key={index}></AppDefinition>
		})
	}

	getNoResultsMessage() {
		const messages = {
			search: ['No results found. Please try again.'],
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