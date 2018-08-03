/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";
import ReactDOM from "react-dom";
//Finsemble font-icons, general styling, and specific styling.
import "../../assets/css/finfont.css";
import "../../assets/css/finsemble.css";
import "../notificationsCenter.css";
import ComplexMenu from "../../complexMenu/ComplexMenu";
import AppContent from "./components/NotificationsContent";


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
			<ComplexMenu headerImgUrl={this.state.headerImgUrl} title="App Catalog" activeSection="Apps" navOptions={[{
				label: "Apps",
				content: <AppContent installed={true} />
			}]} />
		);
	}
}

fin.desktop.main(function () {
	FSBL.addEventListener("onReady", function () {
		console.log("Notification center onReady");
		FSBL.Clients.WindowClient.finsembleWindow.updateOptions({ alwaysOnTop: true });
		FSBL.Clients.DialogManager.showModal();
		
		ReactDOM.render(
			<NotificationsCenter />
			, document.getElementById("bodyHere"));
		
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
					}
				});
			}
		});
	});
});