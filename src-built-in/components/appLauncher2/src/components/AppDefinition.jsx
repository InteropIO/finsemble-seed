import './AppDefinition.css'

import React from  'react'

export default class AppDefinition extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		const app = this.props.app
		return (
			<div className="app-item">
				<div className="app-item-title">{app.friendlyName}</div>
					<div className="app-item-tags">
						{
							app.tags.map((tag, index) => {
								return <span key={index}>{tag}, </span>
							})
						}
					</div>
			</div>
			)
	}
}