import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";

const COUNTS_PUBSUB_TOPIC = "notificationCounts";
let subscribeId = -1;

export default class NotificationCount extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
            notificationCount: 0
        };
        this.bindCorrectContext();
    }
    bindCorrectContext() {
        this.receiveNotificationCount = this.receiveNotificationCount.bind(this);
        this.addListeners = this.addListeners.bind(this);
        this.removeListeners = this.removeListeners.bind(this);
    }
    componentDidMount() {
        this.addListeners();
    }
    componentWillUnmount() {
        this.removeListeners();
    }
    receiveNotificationCount(err, response) {
		console.log("Received notification counts: ", response.data);
        this.setState({
            notificationCount: response.data.displayed
        });
    }
    addListeners() {
        subscribeId = FSBL.Clients.RouterClient.subscribe(COUNTS_PUBSUB_TOPIC, this.receiveNotificationCount);
    }
    removeListeners() {
        FSBL.Clients.RouterClient.unsubscribe(subscribeId);
    }
	
	openNotificationCenter() {
		let windowIdentifier = {componentType: "notificationCenter", windowName: "notificationCenter"};
		FSBL.Clients.LauncherClient.showWindow(windowIdentifier, {
			spawnIfNotFound: true,
			top: "center",
			left: "center",
			width: 800,
			height: 600
		});
	}
	render() {
		//console.log('rendero')
		let tooltip = "Open the Notification Center";
		let buttonClass = "ff-list finsemble-toolbar-button-icon";
		//TODO: move style for count to CSS and improve
		const countStyle = {
			"fontSize": "9px",
			"fontWeight": "bold",
			"width": "15px",
			"height": "15px",
			"background": "rgba(148, 33, 33, 0.70)",
			"color": "white", 
			"borderRadius": "33%",
			"textAlign": "center",
			"verticalAlign": "middle"
		};
		return (<FinsembleButton className={this.props.classes + " icon-only"} buttonType={["Toolbar"]} title={tooltip} onClick={this.openNotificationCenter}>
			<i className={buttonClass}></i><div id="notificationCount" style={countStyle}>{this.state.notificationCount}</div>
		</FinsembleButton>);
	}
}