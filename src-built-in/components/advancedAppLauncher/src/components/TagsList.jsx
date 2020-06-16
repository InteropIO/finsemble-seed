import React from "react";
import Tag from "../../../shared/Tag";
import storeActions from "../stores/StoreActions";
import { getStore } from "../stores/LauncherStore";

let store;

export default class TagsList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tags: storeActions.getTags(),
		};
		this.onTagDelete = this.onTagDelete.bind(this);
		this.onTagListUpdate = this.onTagListUpdate.bind(this);
		store = getStore();
	}

	onTagDelete(tag) {
		storeActions.deleteTag(tag);
	}

	onTagListUpdate(error, data) {
		this.setState({
			tags: data.value,
		});
	}

	componentDidMount() {
		store.addListener({ field: "activeLauncherTags" }, this.onTagListUpdate);
	}

	componentWillUnmount() {
		store.removeListener({ field: "activeLauncherTags" }, this.onTagListUpdate);
	}

	renderTagsList() {
		if (!this.state.tags) return null;
		return this.state.tags.map((tag, index) => {
			return <Tag key={index} name={tag} removeTag={this.onTagDelete} />;
		});
	}

	render() {
		return <div className="tags-list">{this.renderTagsList()}</div>;
	}
}
