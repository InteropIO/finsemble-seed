/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";
import * as storeExports from "../stores/searchStore";
import App from "./App";
import * as _debounce from "lodash.debounce"
let menuStore;
export default class AppList extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.state = {
			loaded: false,
			bestMatch: false,
			appList: []
		};
	}
	bindCorrectContext() {
		this.onChangeDebounced = _debounce(this.onChangeDebounced, 200);
		this.onChange = this.onChange.bind(this);
		this.appListUpdated = this.appListUpdated.bind(this);
	}
	onChange(e) {
		//have to do this or react will squash the event.
		e.persist();
		this.onChangeDebounced(e);
	}
	onChangeDebounced(e) {
		storeExports.Actions.search(e.target.value)
	}
	itemClick() {

	}
	appListUpdated(err, list) {
		this.setState({ appList: list.value || [] })

	}
	componentWillMount() {
		var self = this;
		storeExports.initialize(function (store) {
			menuStore = store;
			store.addListener({ field: "list" }, self.appListUpdated);
			self.setState({ loaded: true })
		});
	}

	render() {
		var self = this;
		if (!this.state.loaded) return null;
		return <div>
			<div className="ListHeader">
				<input className="filterInput" onChange={this.onChange} placeholder="Filter Apps" />
				<div className="ff-search" />
			</div>
			<div className="appContainer">
				{(this.state.appList.map(function (app, index) {
					return <App key={"app" + index} openDetails={self.props.detailsClick} app={app} />
				}))}
			</div>
		</div>
	}
}