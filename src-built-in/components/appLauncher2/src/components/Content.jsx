import React from  'react'
import AppDefinition from './AppDefinition'
import FilterSort from './FilterSort'

export default class Content extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			filter: {
				text: ''
			}
		}
	}

	filterApps() {
		const apps = this.props.activeFolder.appDefinitions
		if (!this.state.filter.text) {
			return apps
		}
		return apps.filter((app) => {
			return app.friendlyName.indexOf(this.state.filter.text) > -1
		})
	}

	render() {
		return (
			<div className="complex-menu-content-row">
				<FilterSort></FilterSort>
				{
					this.filterApps().map((app, index) => {
						return <AppDefinition app={app} key={index}></AppDefinition>
					})
				}
			</div>
		)
	}

}