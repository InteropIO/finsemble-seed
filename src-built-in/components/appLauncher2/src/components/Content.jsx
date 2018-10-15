import React from  'react'
import AppDefinition from './AppDefinition'
import FilterSort from './FilterSort'
import {getStore} from '../stores/LauncherStore'
import storeActions from '../stores/StoreActions'
import sortFunctions from '../utils/sort-functions'

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
		store = getStore()
	}

	filterApps() {
		const sortFunc =  sortFunctions[this.state.sortBy]
		const apps = this.filterAppsByTags(sortFunc(this.state.folder.appDefinitions))
		if (!this.state.filterText) {
			return apps
		}
		return apps.filter((app) => {
			return app.name.indexOf(this.state.filterText) !== -1 || 
			app.friendlyName.indexOf(this.state.filterText) !== -1
		})
	}

	filterAppsByTags(apps) {
		if(!this.state.tags.length) {
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

	componentWillMount() {
		store.addListener({field: 'activeFolder'}, this.onActiveFolderChanged)
		store.addListener({field: 'filterText'}, this.onSearch)
		store.addListener({field: 'sortBy'}, this.onSort)
		store.addListener({field: 'tags'}, this.onTagsUpdate)

	}

	componentWillUnmount() {
		store.removeListener({field: 'activeFolder'}, this.onActiveFolderChanged)
		store.removeListener({field: 'filterText'}, this.onSearch)
		store.removeListener({field: 'sortBy'}, this.onSort)
		store.removeListener({field: 'tags'}, this.onTagsUpdate)

	}

	renderAppList() {
		return this.filterApps().map((app, index) => {
			return <AppDefinition app={app} key={index}></AppDefinition>
		})
	}
	render() {
		return (
			<div className="complex-menu-content-row">
				<FilterSort></FilterSort>
				{this.renderAppList()}
			</div>
		)
	}

}