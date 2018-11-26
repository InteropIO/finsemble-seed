import React from  'react'
import {getStore} from '../stores/LauncherStore'

export default class SearchBox extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			search: ''
		}
		this.onSearch = this.onSearch.bind(this)
	}
	onSearch(event) {
		this.setState({
			search: event.target.value
		}, () => {
			getStore().setValue({
				field: 'filterText', 
				value: this.state.search.toLowerCase()
			})
		})
	}

	render() {
		return (
			<div className="search-box"> 
				<i className="ff-search" />
				<input value={this.state.search}  
				type="text" placeholder="Search" 
				onChange={this.onSearch} />
			</div>	
			)
	}
}