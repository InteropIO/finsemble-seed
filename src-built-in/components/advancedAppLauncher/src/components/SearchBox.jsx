import React from  'react'
import {getStore} from '../stores/LauncherStore'

export default class SearchBox extends React.Component {

	constructor(props) {
		super(props)
		this.textInput = React.createRef();
		this.state = {
			search: ''
		}
		this.onSearch = this.onSearch.bind(this)
		this.clearSearch = this.clearSearch.bind(this)
		this.focus = this.focus.bind(this)
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

	clearSearch() {
		this.setState({
			search: ''
		}, () => {
			getStore().setValue({
				field: 'filterText',
				value: null
			})
			this.focus()
		})
	}

	focus() {
		this.textInput.current.focus();
	}

	render() {
		return (
			<div className="search-box"> 
				<i className="ff-search" />
				<input required className="input-box" ref={this.textInput} value={this.state.search}  
				type="text" placeholder="Search" 
				onChange={this.onSearch} />
				<button className="close-icon" onClick={this.clearSearch} type="reset"></button>
			</div>	
			)
	}
}