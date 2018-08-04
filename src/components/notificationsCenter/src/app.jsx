/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";
import ReactDOM from "react-dom";
//Finsemble font-icons, general styling, and specific styling.
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import "../notificationsCenter.css";
import ComplexMenu from "../../../../src-built-in/components/complexMenu/ComplexMenu";
import NotificationsContent from "./components/NotificationsContent";

//override complex menu's hideWindow to make it use the toggle instead of closing
class PersistentMenu extends ComplexMenu{
	constructor(props){
		super(props);
		this.className = this.className + ' persistent-menu';
		this.hideWindow = function() {
			FSBL.Clients.WindowClient.getCurrentWindow().hide();
			FSBL.Clients.DialogManager.hideModal();
		};
	}
}

/**
 * 
 *
 * @class NotificationsCenter
 * @extends {React.Component}
 */
class NotificationsCenter extends React.Component {
	constructor(props) {
		super(props);
		this.finWindow = fin.desktop.Window.getCurrent();
		this.state = {
			loaded: false,
			headerImgUrl: ""
		};
	}

	componentWillMount() {
		FSBL.Clients.ConfigClient.getValues(null, (err, config) => {
			if (config.startup_app && config.startup_app.applicationIcon) {
				console.log("config.startup_app.applicationIcon", config.startup_app.applicationIcon)
				this.setState({
					loaded: true,
					// headerImgUrl: config.startup_app.applicationIcon
				});
			}
		})
		this.setState({ activeSection: this.props && this.props.activeSection ? this.props.activeSection : '' })//Props did not exist in the contructor
	}
	render() {
		var self = this;
		if (!this.state.loaded) return null;
		return (
			<PersistentMenu key={"theMenu"} headerImgUrl={this.state.headerImgUrl} title="Notifications" activeSection="All" navOptions={[{
				label: "All",
				content: <NotificationsContent installed={true} key={"All"} />
			}]} />
		);
	}
}

fin.desktop.main(function () {
	FSBL.addEventListener("onReady", function () {
		console.log("Notification center onReady");
		
		ReactDOM.render(
			<NotificationsCenter />
			, document.getElementById("bodyHere"));
		
		//Notificaition center persists so show/hide on a router channel 
		FSBL.Clients.RouterClient.addListener("notificationCenter.toggle", function (error, response) {
			if (error) {
				Logger.system.log('notificationCenter toggle error: ' + JSON.stringify(error));
			} else {
				let window = FSBL.Clients.WindowClient.getCurrentWindow();        
				window.isShowing(function(showing) {
					if(showing){
						window.hide();
					} else {
						window.show(); //assumes window is already positioned correctly, if not then use LauncherClient.showWindow instead
						FSBL.Clients.DialogManager.showModal();
					}
				});
			}
		});
	});
});