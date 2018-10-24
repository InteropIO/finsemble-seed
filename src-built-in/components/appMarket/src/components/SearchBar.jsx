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
import Toast from './Toast';
import Tag from './Tag';
import TagsMenu from '../../../shared/TagsMenu';

class SearchBar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			searchValue: "",
			tagSelectorOpen: false
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.changeSearch = this.changeSearch.bind(this);
		this.toggleTagSelector = this.toggleTagSelector.bind(this);
		this.selectTag = this.selectTag.bind(this);
		this.removeTag = this.removeTag.bind(this);
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.activeTags.length === 0 && !nextProps.backButton) {
			this.setState({
				searchValue: ""
			});
		}
	}
	changeSearch(e) {
		this.setState({
			searchValue: e.target.value
		});
		this.props.changeSearch(e.target.value);
	}
	toggleTagSelector() {
		this.setState({
			tagSelectorOpen: !this.state.tagSelectorOpen
		});
	}
	selectTag(tag) {
		this.setState({
			tagSelectorOpen: false
		}, this.props.tagSelected(tag));
	}
	removeTag(tag) {
		const callParent = () => {
			this.props.removeTag(tag);
		}

		if (this.props.activeTags.length <= 1) {
			this.setState({
				searchValue: ""
			}, callParent);
		} else callParent();
	}
	render() {

		let tagListClass = "tag-selector-content";
		if (!this.state.tagSelectorOpen) {
			tagListClass += " hidden";
		}

		return (
			<div className='search-main'>
				<Toast installationActionTaken={this.props.installationActionTaken} />
				<div className="search-action-items">
					{this.props.backButton ?
						<div className='search-back' onClick={this.props.goHome}>
							<i className='ff-arrow-back'></i>
							<span className='button-label'>Back</span>
						</div> : null}
					<div className="search-input-container">
						<i className='ff-search'></i>
						<input className='search-input' type="text" value={this.state.searchValue} onChange={this.changeSearch} />
					</div>
					<TagsMenu list={this.props.tags} onItemClick={this.selectTag} label={"Tags"} align='right' />
				</div>
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