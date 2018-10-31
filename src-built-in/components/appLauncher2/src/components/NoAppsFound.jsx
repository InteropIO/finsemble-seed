import React from  'react'

export default class NoAppsFound extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className="no-results"> 
				{this.props.message.map((message, index) => {
					return <span key={index}>{message}</span>
				})}
			</div>	
		)
	}
}