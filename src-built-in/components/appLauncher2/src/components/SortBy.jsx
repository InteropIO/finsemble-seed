import React from  'react'
import {getStore} from '../stores/LauncherStore'
import storeActions from '../stores/StoreActions'
import sortFunctions from '../utils/sort-functions'

export default class SortBy extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			sortBy: storeActions.getSortBy()
		}
		this.onOptionClick = this.onOptionClick.bind(this)
	}
	onOptionClick(option) {
		this.setState({
			sortBy: option
		}, () => {
			getStore().setValue({
				field: 'sortBy', 
				value: this.state.sortBy
			})
		})
	}
	renderOptionsList() {
		return Object.keys(sortFunctions).map((option, index) => {
			let classes = 'sort-option pointer '
			if (option === this.state.sortBy) classes += 'active'
				return <span key={index} 
			onClick={() => this.onOptionClick(option)} 
			className={classes}>{option}</span>
		})
	}

	render() {
		return (
			<div className="sort"> 
				Sort by: {this.renderOptionsList()}
			</div>
			)
	}
}