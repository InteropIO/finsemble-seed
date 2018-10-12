import React from  'react'
import AppDefinition from './AppDefinition'
import FilterSort from './FilterSort'
import {getStore} from '../stores/LauncherStore'
import storeActions from '../stores/StoreActions'

export default class Content extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			filterText: storeActions.getSearchText(),
			folder: storeActions.getActiveFolder()
		}
		this.onSearch = this.onSearch.bind(this)
		this.onActiveFolderChanged = this.onActiveFolderChanged.bind(this)
	}

	filterApps() {
		const apps = this.state.folder.appDefinitions
		if (!this.state.filterText) {
			return apps
		}
		return apps.filter((app) => {
			return app.name.indexOf(this.state.filterText) !== -1 || 
			app.friendlyName.indexOf(this.state.filterText) !== -1
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

	componentWillMount() {
		getStore().addListener({field: 'activeFolder'}, this.onActiveFolderChanged)
		getStore().addListener({field: 'filterText'}, this.onSearch)

	}

	componentWillUnmount() {
		getStore().removeListener({field: 'activeFolder'}, this.onActiveFolderChanged)
		getStore().removeListener({field: 'filterText'}, this.onSearch)

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