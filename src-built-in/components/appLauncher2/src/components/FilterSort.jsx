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
			tags: [],
			search: ''
		}
		this.onSearch = this.onSearch.bind(this)
	}

	async setStateValues(){
		this.setState({
			tags: await storeActions.getAllAppsTags()
		})
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

	componentDidMount(){
		this.setStateValues()
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
					list={this.state.tags}
					onItemClick={this.onTagClick}/>
			</div>
			)
	}
}