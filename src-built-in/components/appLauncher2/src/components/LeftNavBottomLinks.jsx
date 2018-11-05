import React from 'react'

const bottomEntries = [
	{ name: 'New App', icon: 'ff-new-workspace', click: 'openAdHoc' },
	{ name: 'New Dashboard', icon: 'ff-dashboard-new' },
	{ name: 'App Catalog', icon: 'ff-list', click: 'openAppMarket' }
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
						let func = entry.click && this.props[entry.click] ? this.props[entry.click] : Function.prototype;
						return (
							<div className={className} key={index} onClick={func ? func : Function.prototype}>
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