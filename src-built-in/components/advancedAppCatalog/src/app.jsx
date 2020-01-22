/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from "react-dom";

//components
import SearchBar from "./components/SearchBar";
import Home from "./components/Home";
import AppResults from "./components/AppResults";
import AppShowcase from "./components/Showcase/AppShowcase";

//data
import { createStore, getStore } from "./stores/appStore";
import storeActions from "./stores/storeActions";

//style
import "../appCatalog.css";

export default class AppMarket extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			apps: [],
			isLoading: false,
			serverError: false,
			installed: [],
			tags: [],
			installationActionTaken: null
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.addedAppsChanged = this.addedAppsChanged.bind(this);
		this.update = this.update.bind(this);
		this.goHome = this.goHome.bind(this);
		this.addTag = this.addTag.bind(this);
		this.removeTag = this.removeTag.bind(this);
		this.changeSearch = this.changeSearch.bind(this);
		this.openAppShowcase = this.openAppShowcase.bind(this);
		this.stopShowingInstalledNotification = this.stopShowingInstalledNotification.bind(this);
		this.compileAddedInfo = this.compileAddedInfo.bind(this);
		this.getPageContents = this.getPageContents.bind(this);
		this.determineActivePage = this.determineActivePage.bind(this);
		this.navigateToShowcase = this.navigateToShowcase.bind(this);
		this.viewApp = this.viewApp.bind(this);
		this.isActiveApp = this.isActiveApp.bind(this);
		this.getActiveTags = this.getActiveTags.bind(this);
	}

	componentWillMount() {
		//For more information on async react rendering, see here
		//https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html

		this.setState({
			isLoading: true
		}, () => {
			this._asyncAppRequest = storeActions.getApps().then(apps => {
				this.setState({
					apps,
					isLoading: false
				});
			}).catch((err) => {
				this.setState({
					serverError: true
				}, () => {
					FSBL.Clients.Logger.error("Error connecting to FDC3 AppD server.", err);
				});
			});
		});

		this._asyncTagsRequest = storeActions.getTags().then(tags => {
			this.setState({
				tags
			});
		}).catch((err) => {
			this.setState({
				serverError: true
			}, () => {
				FSBL.Clients.Logger.error("Error retrieving tags from FDC3 AppD server.", err);
			});
		});
	}

	componentDidMount() {
		getStore().addListener({ field: "appDefinitions" }, this.addedAppsChanged);
		getStore().addListener({ field: "filteredApps" }, this.update);
		getStore().addListener({ field: "activeTags" }, this.update);
		getStore().addListener({ field: "activeApp" }, this.openAppShowcase);
		// Get notified when user wants to view an app
		FSBL.Clients.RouterClient.addListener("viewApp", this.viewApp);
		let installed = storeActions.getInstalledApps();

		this.setState({
			installed: Object.keys(installed)
		});
	}

	componentWillUnmount() {
		getStore().removeListener({ field: "appDefinitions" }, this.addedAppsChanged);
		getStore().removeListener({ field: "filteredApps" }, this.update);
		getStore().removeListener({ field: "activeTags" }, this.update);
		getStore().removeListener({ field: "activeApp" }, this.openAppShowcase);
		// Get notified when user wants to view an app
		FSBL.Clients.RouterClient.removeListener("viewApp", this.viewApp);

		//Make sure async requests have finished.
		if (this._asyncAppRequest && this._asyncAppRequest.cancel) {
			this._asyncAppRequest.cancel();
		}

		if (this._asyncTagsRequest && this._asyncTagsRequest.cancel) {
			this._asyncTagsRequest.cancel();
		}
	}

	viewApp(error, event) {
		!error && this.navigateToShowcase(event.data.app.appID);
	}

	addedAppsChanged() {
		let action;
		if (this.state.installed.length > Object.keys(storeActions.getInstalledApps()).length) {
			//If the components installed apps is greater than that of the store, that means an app was removed
			action = "remove";
		} else if (this.state.installed.length < Object.keys(storeActions.getInstalledApps()).length) {
			//If the component's installed apps is less than that of the store, that means an app was added
			action = "add";
		}

		if (action) {
			this.setState({
				installationActionTaken: action,
				installed: Object.keys(storeActions.getInstalledApps())
			}, () => {
				setTimeout(this.stopShowingInstalledNotification, 1500);
			});
		}
	}

	/**
	 * Force an update. Used to update from store listeners.
	 *
	 * @memberof AppMarket
	 */
	update() {
		this.forceUpdate();
	}

	/**
	 * Determines the apps page based on the state of the activeTags, search text, etc
	 */
	determineActivePage() {
		const activeTags = this.getActiveTags();
		const filteredApps = this.getFilteredApps();
		const activeApp = this.getActiveApp();
		const forceSearch = storeActions.getForceSearch();
		let page;

		if (activeApp && !forceSearch) {
			page = "showcase";
		} else if (filteredApps.length > 0 || forceSearch) {
			page = "appSearch";
		} else if (filteredApps.length === 0 && activeTags.length === 0) {
			page = "home";
		}

		return page;
	}

	/**
	 * Returns the activeApp from the Store
	 *
	 * @returns {string} activeApp
	 * @memberof AppMarket
	 */
	getActiveApp() {
		return storeActions.getActiveApp();
	}

	/**
	 * Checks if we have an activeApp defined
	 *
	 * @returns {boolean}
	 * @memberof AppMarket
	 */
	isActiveApp() {
		return storeActions.getActiveApp() !== null;
	}

	/**
	 * Returns the active tags from the store
	 *
	 * @returns {array} activeTags
	 * @memberof AppMarket
	 */
	getActiveTags() {
		return storeActions.getActiveTags();
	}

	/**
	 * Returns the filtered list of apps from search
	 *
	 * @returns {object} filteredApps
	 * @memberof AppMarket
	 */
	getFilteredApps() {
		return storeActions.getFilteredApps();
	}

	/**
	 * Calls the store to add a tag to the activeTag list. Also updates the app view to switch to the AppResults page (since adding a tag implies filtering has begun)
	 * @param {string} tag The name of the tag to add
	 */
	addTag(tag) {
		storeActions.addTag(tag);
	}
	/**
	 * Calls the store to remove a tag from the activeTag list. Also updates the app view to switch to the homepage if all tags have been removed
	 * @param {string} tag The name of the tag to add
	 */
	removeTag(tag) {
		storeActions.removeTag(tag);
	}
	/**
	 * Action to take when the back button is clicked (which just goes home)
	 */
	goHome() {
		storeActions.goHome();
	}
	/**
	 * Performs a search through the catalog
	 * @param {string} search The text to search the catalog with
	 */
	changeSearch(search) {
		storeActions.searchApps(search);
	}
	/**
	 * When the notification for installing/removing an app is shown a timeout is set to call this function to cease showing the notification
	 */
	stopShowingInstalledNotification() {
		this.setState({
			installationActionTaken: null
		});
	}

	navigateToShowcase(id) {
		storeActions.openApp(id);
	}

	/**
	 * Opens the AppShowcase page for the app supplied
	 */
	openAppShowcase() {
		let app = storeActions.getActiveApp();
		
		if (app !== null) {
			storeActions.setForceSearch(false);
			storeActions.clearTags();
			storeActions.clearFilteredApps();
		}

		this.forceUpdate();
	}
	/**
	 * Compiles a list of apps that are installed from the information received back from appd
	 * and the information contained on the system
	 * TODO: This is temporary. It will change when there is actually a way to know from launcher what apps are installed, and which are not
	 * @param {boolean} filtered If true, uses the filtered apps array. Otherwise uses all apps
	 */
	compileAddedInfo(filtered) {
		let { installed } = this.state;
		let forceSearch =  storeActions.getForceSearch();
		let apps;
		if (filtered || forceSearch) {
			apps = storeActions.getFilteredApps();
		} else {
			apps = this.state.apps;
		}

		return apps.map((app) => {
			if (installed.includes(app.appId)) {
				app.installed = true;
			} else {
				app.installed = false;
			}

			return app;
		});
	}
	getPageContents() {
		const filteredApps = this.getFilteredApps();
		const activeTags = this.getActiveTags();
		let activePage = this.determineActivePage();
		let apps = this.compileAddedInfo((filteredApps.length > 0));
		//Force default case if activepage isn't search and apps.length is 0
		if (apps.length === 0 && activePage !== "appSearch") activePage = -1;
		switch (activePage) {
			case "home":
				return (
					<Home cards={apps} seeMore={this.addTag} addApp={this.addApp} removeApp={this.removeApp} addTag={this.addTag} viewAppShowcase={this.navigateToShowcase} />
				);
			case "appSearch":
				return (
					<AppResults cards={apps} tags={activeTags} addApp={this.addApp} removeApp={this.removeApp} viewAppShowcase={this.navigateToShowcase} addTag={this.addTag} />
				);
			case "showcase":
				let app = this.compileAddedInfo(false).find((app) => {
					return this.getActiveApp() === app.appId;
				});
				return (
					<AppShowcase app={app} addApp={this.addApp} removeApp={this.removeApp} addTag={this.addTag} />
				);
			default:
				return (
					<div></div>
				);
		}
	}
	render() {

		let { tags } = this.state;
		let page = this.determineActivePage();
		let pageContents = this.getPageContents();

		return (
			<div>
				{this.state.serverError && 
					<div className='server-error'>
						<br />
						<br />
						<span>Catalog contents are currently unavailable.</span>
						<br />
						<span>Please check your connection or consult your System Admin.</span>
					</div>
				}
				{this.state.apps.length === 0 && !this.state.isLoading &&
					<div className='server-error'>
						<br />
						<br />
						<span>There are no apps available in this catalog.</span>
						<br />
						<span>Please contact your System Admin.</span>
					</div>
				}
				{this.state.apps.length > 0 &&
					<div>
						<SearchBar hidden={page === "showcase" ? true : false} backButton={page !== "home"} tags={tags} activeTags={this.getActiveTags} tagSelected={this.addTag}
						removeTag={this.removeTag} goHome={this.goHome} installationActionTaken={this.state.installationActionTaken}
						search={this.changeSearch} isViewingApp={this.isActiveApp} />
						<div className="market_content">
							{pageContents}
						</div>
					</div>
				}
			</div>
		);
	}
}

if (window.FSBL && FSBL.addEventListener) { 
	FSBL.addEventListener("onReady", FSBLReady); 
} else { 
	window.addEventListener("FSBLReady", FSBLReady);
}

function FSBLReady() {
	createStore((store) => {
		storeActions.initialize(() => {
			ReactDOM.render(
				<AppMarket />,
				document.getElementById("bodyHere"));
		});
	});
}
