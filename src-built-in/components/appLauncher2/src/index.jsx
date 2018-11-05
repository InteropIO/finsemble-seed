import "../style.css"
import "../../../../assets/css/font-finance.css"
import "../../../../assets/css/finsemble.css"
// Import js modules
import React from  'react'
import ReactDOM from  'react-dom'
import {createStore, getStore} from './stores/LauncherStore'
// Import React components
import LeftNav from './components/LeftNav'
import Content from './components/Content'
import { FinsembleMenu } from '@chartiq/finsemble-react-controls';
import storeActions from "../../appCatalog2/src/stores/storeActions";

class AppLauncher extends React.Component {

	constructor(props) {
		super(props);
		this.finWindow = fin.desktop.Window.getCurrent();
		this.openAppMarket = this.openAppMarket.bind(this);
		this.openAdHoc = this.openAdHoc.bind(this);
	}

	componentWillMount() {
		this.finWindow.addEventListener('shown', () => {
			this.finWindow.focus();
		});
	}

	openAppMarket() {
		FSBL.Clients.LauncherClient.showWindow(
			{
				componentType: "App Catalog 2"
			},
			{
				monitor: "mine",
				staggerPixels: 0,
				spawnIfNotFound: true,
				left: "center",
				top: "center"
			}
		)
	}

	openAdHoc() {
		FSBL.Clients.DialogManager.open("AdhocComponentForm", {}, () => {
			//TODO: Do something here to add the new app to the launcher
		});
	}

	render() {
		return (
			<FinsembleMenu className="app-launcher-menu">
				<div className="app-launcher">
					<div className="complex-menu-wrapper">
						<LeftNav openAppMarket={this.openAppMarket} openAdHoc={this.openAdHoc} />
						<Content />
					</div>
				</div>
			</FinsembleMenu>
		)
	}
}

fin.desktop.main(function () {
	FSBL.addEventListener("onReady", function () {
		createStore((store) => {
			ReactDOM.render(<AppLauncher />, document.getElementById("wrapper"));
		});
	});
});