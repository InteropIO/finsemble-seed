import React from  'react'
import SearchBox from './SearchBox'
// import TagsMenu from './TagsMenu'
import TagsMenu from '../../../shared/TagsMenu';
import SortBy from './SortBy'
import TagsList from './TagsList'
import {getStore} from '../stores/LauncherStore'
import storeActions from '../stores/StoreActions'

export default class FilterSort extends React.Component {

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
				value: this.state.search
			})
		})
	}

	/**
	* Add tag to list in local store
	* so that other components get notified
	**/
	onTagClick(tag) {
		storeActions.addTag(tag)
	}

	/**
	* Extract a list of tags from all the app
	* within the active folder.
	**/
	extractTags() {
		let tags = []
		storeActions.getActiveFolder()
		.appDefinitions.forEach((app) => {
			app.tags.forEach((tag) => {
				// Make sure we have a unique tags list
				tags.indexOf(tag) < 0 && tags.push(tag)
			})
		})
		return tags
	}

	render() {
		return (
			<div className="filter-sort">
				<SearchBox />
				<TagsList />
				<SortBy />
				<TagsMenu
					label="Tags"
					align="right"
					list={this.extractTags()}
					onItemClick={this.onTagClick}/>
			</div>
			)
	}
}