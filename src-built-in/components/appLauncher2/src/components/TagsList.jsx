import React from 'react'
import Tag from '../../../shared/Tag';
import storeActions from '../stores/StoreActions'
import {getStore} from '../stores/LauncherStore'

export default class TagsList extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			tags: []
		}
	}

	onTagDelete(tag) {
		storeActions.deleteTag(tag)
	}

	onTagListUpdate(error, data) {
		this.setState({
			tags: data.value
		})
	}

	componentWillMount() {
		getStore().addListener({field: 'tags'}, this.onTagListUpdate.bind(this))
	}

	componentWillUnmount () {
		getStore().removeListener({field: 'tags'}, this.onTagListUpdate.bind(this))
	}

	renderTagsList() {
		return 	this.state.tags.map((tag, index) => {
			return (
				<Tag key={index} name={tag} removeTag={this.onTagDelete} />
			);
		})
	}

	render() {
		return (<div className="tags-list">{this.renderTagsList()}</div>)
	}
}