import React from 'react'

const bottomEntries = [
	{ name: 'New App', icon: 'ff-new-workspace' },
	{ name: 'New Dashboard', icon: 'ff-dashboard-new' },
	{ name: 'App Catalog', icon: 'ff-list' }
]

export default class LeftNavBottomLinks extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className="bottom">
				{
					bottomEntries.map((entry, index) => {
						let className = 'complex-menu-section-toggle'
						return (
							<div className={className} key={index}>
								{entry.icon !== undefined ? <i className={entry.icon}></i> : null}
								{entry.name}
							</div>
						)
					})
				}
			</div>
		)
	}
}