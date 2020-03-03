/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";

export default class Chat extends React.Component {
	constructor(props) {
		super(props);
		this.bindCorrectContext();
		this.state = {
			unread: 0
		};
	}
	componentWillMount(){
		let self = this;
		FSBL.Clients.RouterClient.subscribe("chatService-unreadCount", function (err, response) {
		//console.log("unread messages", err, response);
			self.setState({
				unread: response.data.count
			});
		});
		FSBL.Clients.RouterClient.addListener("ChatService.OpenMainChat", function (err, response) {

		});
		FSBL.Clients.RouterClient.addListener("ChatService.loseMainChat", function (err, response) {

		});
	}
	bindCorrectContext(){
		this.toggleChat = this.toggleChat.bind(this);
	}
	toggleChat(event) {
	//console.log("event", event.target);
	//console.log("event.target", event.target.clientHeight);
	//console.log("event.target.offsetLeft", event.target.offsetLeft);
	//console.log("screenX", event.screenX);
		//clientX
		//clientY
		FSBL.Clients.LauncherClient.getMonitor(null, function(monitor){
			FSBL.Clients.RouterClient.transmit("chatService.toggleMainChat", {whichMonitor: monitor.position});
		});
	}
	render() {
		let tooltip = "Chat";
		let buttonClass = "ff-chat" + (this.state.unread > 0 ? " badge" : "");
		return (<FinsembleButton buttonType={["Toolbar"]} className={this.props.classes + " icon-only"} title={tooltip} onClick={this.toggleChat}>
			<i className={buttonClass}></i>
		</FinsembleButton>);
	}
}