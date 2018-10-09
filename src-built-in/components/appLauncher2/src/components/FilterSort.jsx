import './FilterSort.css'
import React from  'react'

export default class FilterSort extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		const app = this.props.app
		return (
			<div className="filter-sort">
				<div className="search-box"> 
					<input type="text" placeholder="Search.." />
				</div>
				<div className="sort"> 
					Sort by: 
					<span className="first active sort-option pointer">Alphabetical</span>
					<span className="sort-option pointer">Recent</span>
					<span className="sort-option pointer">Favorites</span>
				</div>			
			</div>
			)
	}
}