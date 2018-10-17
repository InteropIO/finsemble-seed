/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React, { Component } from "react";

//components
import Tag from './Tag';

class SearchBar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			searchValue: "",
			selectedTag: "Tags"
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.changeSearch = this.changeSearch.bind(this);
		this.changeTag = this.changeTag.bind(this);
		this.removeTag = this.removeTag.bind(this);
	}
	componentDidMount() {
		this.setState({
			selectedTag: this.props.tags[0]
		});
	}
	changeSearch(e) {
		this.setState({
			searchValue: e.target.value
		});
		this.props.changeSearch(e.target.value);
	}
	changeTag(e) {
		if (e.target.value === "Tags") return;
		this.setState({
			selectedTag: "Tags"
		}, this.props.tagSelected(e.target.value));
	}
	removeTag(tag) {
		this.setState({
			selectedTag: "Tags"
		}, this.props.removeTag(tag));
	}
	render() {
		return (
			<div className='search-main'>
				<button className='search-back' onClick={this.props.goHome}>
					<i className='ff-arrow-back'></i>
				    <span className='button-label'>Back</span>
				</button>
				<i className='ff-search'></i>
				<input className='search-input' type="text" value={this.state.searchValue} onChange={this.changeSearch} />
				<select value={this.state.selectedTag} onChange={this.changeTag}>
					<option key={-1} value={"Tags"}>Tags</option>
					{this.props.tags.map((tag, i) => {
						return (
							<option key={i} value={tag}>{tag}</option>
						);
					})}
				</select>
				<div className='label-bar'>
					{this.props.activeTags.map((tag, i) => {
						return (
							<Tag key={tag} name={tag} removeTag={this.removeTag} />
						);
					})}
				</div>
			</div>
		);
	}
}

export default SearchBar;