/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * List of notificaiton data pulled from the 
 *
 */
import React from "react";
// import * as storeExports from "../stores/searchStore";
import Notification from "./Notification";
import * as _debounce from "lodash.debounce";

import * as notifier from '../../../../services/notification/notificationClient';

// let menuStore;
export default class NotificationsList extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.state = {
			listFilter: {
				type: "displayed"
			},
			notifyList: []
		};
	}
	bindCorrectContext() {
		this.onChangeDebounced = _debounce(this.onChangeDebounced, 200);
		this.onChange = this.onChange.bind(this);
		this.notificationsListUpdated = this.notificationsListUpdated.bind(this);
	}
	onChange(e) {
		//have to do this or react will squash the event.
		e.persist();
		this.onChangeDebounced(e);
	}
	onChangeDebounced(e) {
		//storeExports.Actions.search(e.target.value)


	}
	notificationsListUpdated(err, updateTypes) {
		var self = this;
		if (!err && (!updateTypes || updateTypes[this.state.listFilter.type])) {
			//pull the update from the notifier
			notifier.getNotificationsHistory(this.state.listFilter.type, function (error, data) {
				if (error) {
					console.error("Failed to retrieve notification history", err);
				} else {
					self.setState({ notifyList: data || [] })
				}
			})
		} //else ignore update
	}

	componentWillMount() {
		var self = this;

		
		// storeExports.initialize(function (store) {
		// 	menuStore = store;
			
		// 	//TODO: listen for notification data updates
			
			
		// 	store.addListener({ field: "list" }, self.notificationsListUpdated);
		// 	self.setState({ loaded: true })
		// });
		
		//get data to display
		this.notificationsListUpdated();
		
		//listen for notification data updates
		notifier.listenForUpdates(self.notificationsListUpdated);
	}

	render() {
		var self = this;
		return <div>
			<div className="ListHeader">
				<input className="filterInput" onChange={this.onChange} placeholder="Filter Notifications" />
				<div className="ff-search" />
			</div>
			<div className="notifications-container">
				{(this.state.notifyList.map(function (aNotification, index) {
					return <Notification key={aNotification.id} notification={aNotification} />
				}))}
			</div>
		</div>
	}
}