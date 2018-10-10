import React from  'react'

const bottomEntries = [
'New folder',
'New dashboard',
'App catalog'
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
						{entry}
						</div>
						)
				})
			}
			</div>
			)
	}
}