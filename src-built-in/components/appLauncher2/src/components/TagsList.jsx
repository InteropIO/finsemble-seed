import React from  'react'
import storeActions from '../stores/StoreActions'
import {getStore} from '../stores/LauncherStore'

export default class TagsList extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			tags: storeActions.getTags()
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
			return <span key={index} className="tag-item">
			{tag} <i className="ff-close" onClick={this.onTagDelete}/>
			</span>
		})
	}

	render() {
		return (<div className="tags-list">{this.renderTagsList()}</div>)
	}
}