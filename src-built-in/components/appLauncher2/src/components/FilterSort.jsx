import './FilterSort.css'
import React from  'react'
import TagsMenu from './TagsMenu'

export default class FilterSort extends React.Component {

	constructor(props) {
		super(props)
	}

	onItemClick(item) {
		console.log(item)
	}

	render() {
		const app = this.props.app
		const list = ['one', 'two', 'three']
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
				<TagsMenu label="Tags" align="right" list={list} onItemClick={this.onItemClick}/>		
			</div>
			)
	}
}