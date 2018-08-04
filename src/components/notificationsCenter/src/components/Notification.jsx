/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";
import * as storeExports from "../stores/searchStore";
import * as notifier from '../../../../services/notification/notificationClient';

let menuStore;
export default class Notification extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.state = {

		};
	}
	bindCorrectContext() {
		this.performAction = this.performAction.bind(this);
		this.dismissNotification = this.dismissNotification.bind(this);
	}

	performAction() {
		console.log("action click", this.props);
		if (this.props.notification.params.action){
			notifier.performAction(this.props.notification.id);
		} else {
			notifier.dismissNotification(this.props.notification.id);
		}
	}

	dismissNotification() {
		notifier.dismissNotification(this.props.notification.id);
	}

	componentWillMount() {
 
	}

	render() {
		var self = this;
		console.log(this.props);

		let buttonText = "View";
		if (this.props.notification.params && this.props.notification.params.action 
			&& this.props.notification.params.action.buttonText) {
				buttonText = this.props.notification.params.action.buttonText;
		}

		return <div className="notification-item">
			<div className="notification-icon"><img src={this.props.notification.iconURL} /></div>
			<div className="notification-message">{this.props.notification.message}</div>
			{this.props.notification.params.action ? 
				(<button id="notification-action" onClick={self.performAction} className="notification-action\">{buttonText}</button> ) 
				: 
				null
			}
			<button id="notification-dismiss" onClick={self.dismissNotification} className="notification-dismiss">dismiss</button>
			
		</div>
	}
}