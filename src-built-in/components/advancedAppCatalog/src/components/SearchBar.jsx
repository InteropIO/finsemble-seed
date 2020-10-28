/*!
* Copyright 2017 - 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React, { Component } from "react";

//data
import storeActions from "../stores/storeActions";

//components
import Toast from "./Toast";
import Tag from "../../../shared/Tag";
import TagsMenu from "../../../shared/TagsMenu";

/**
 * The search bar, tags filter menu, and any active tags being filtered on
 * @param {object} props Component props
 * @param {boolean} [props.backButton] If true, display a back button for going back to the homepage
 * @param {array} props.tags An array of all available tags for the tags menu
 * @param {array} props.activeTags An array of active tags acting as search criteria
 * @param {func} props.goHome Function to handle sending the app back to the homepage
 * @param {func} props.installationActionTaken Function that handles display/hiding the success/failure message from adding/removing an app
 */
class SearchBar extends Component {
	constructor(props) {
		super(props);
		this.textInput = React.createRef();
		this.state = {
			tagSelectorOpen: false,
			searchText: ""
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.goHome = this.goHome.bind(this);
		this.changeSearch = this.changeSearch.bind(this);
		this.toggleTagSelector = this.toggleTagSelector.bind(this);
		this.selectTag = this.selectTag.bind(this);
		this.removeTag = this.removeTag.bind(this);
		this.focus = this.focus.bind(this);
	}

	/**
	 * Handles changing the component state for handling local input value. Also calls parent function to effect the store
	 * @param {object} e React Synthetic event
	 */
	changeSearch(e) {
		const { value : searchTerms } = e.target;
		this.setState({searchText: searchTerms});
		this.props.search(searchTerms);
	}

	/**
	 * Opens/hides the tag selection menu
	 */
	toggleTagSelector() {
		this.setState({
			tagSelectorOpen: !this.state.tagSelectorOpen
		});
	}
	/**
	 * Calls parent function to add a tag to filters
	 * @param {string} tag The name of the tag
	 */
	selectTag(tag) {
		let tags = storeActions.getActiveTags();

		this.setState({
			tagSelectorOpen: false
		}, () => {
			if (tags.includes(tag)) {
				storeActions.removeTag(tag);
			} else {
				storeActions.addTag(tag);
			}
		});
	}
	/**
	 * Calls parent function to remove a tag from filters
	 * @param {string} tag The name of the tag
	 */
	removeTag(tag) {
		storeActions.removeTag(tag);
	}
	/**
	 * Clears search because 'back' button was clicked
	 */
	goHome() {
		this.setState({searchText: ""});
		this.props.goHome();
	}

	focus() {
		this.textInput.current.focus();
	}

	render() {
		let tagListClass = "tag-selector-content";

		if (!this.state.tagSelectorOpen) {
			tagListClass += " hidden";
		}

		let activeTags = storeActions.getActiveTags();

		return (
			<div className='search-main'>
				<Toast installationActionTaken={this.props.installationActionTaken} />
				<div className="search-action-items">
					{this.props.backButton ?
						<div className='search-back' onClick={this.goHome}>
							<i className='ff-arrow-back'></i>
							<span className='button-label'>Back</span>
						</div> : null}
					<div className="search-input-container">
						<i className='ff-search'></i>
						<input className='search-input' required ref={this.textInput} placeholder="Search" type="text" value={this.state.searchText} onChange={this.changeSearch} />
						<button class="close-icon" onClick={this.goHome} type="reset"></button>
					</div>
					<TagsMenu active={activeTags} list={this.props.tags} onItemClick={this.selectTag} label={"Tags"} align='right' />
				</div>
				<div className='label-bar'>
					{activeTags.map((tag, i) => {
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