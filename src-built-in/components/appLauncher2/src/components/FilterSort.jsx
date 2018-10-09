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
				<input type="text" placeholder="Search.." />
			</div>
			)
	}
}