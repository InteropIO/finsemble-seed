import React from  'react'

const styles = {
	textAlign: 'center'
}

export default class NoAppsFound extends React.Component {

	constructor() {
		super()
	}

	render() {
		return (
			<div style={styles} className="no-results"> 
				<p>There’s nothing here!</p>
				<p>Add apps and Dashboards to Favorites to view them here.</p>
			</div>	
			)
	}
}