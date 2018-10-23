import React from  'react'

export default class NoAppsFound extends React.Component {

	static defaultProps = {
		styles: {
			lineHeight: '16px',
			marginTop: '30px',
			textAlign: 'center'
		}
	}

	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div style={this.props.styles} className="no-results"> 
				{this.props.message}
			</div>	
		)
	}
}