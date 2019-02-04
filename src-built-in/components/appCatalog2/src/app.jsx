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
			filteredApps: [],
			installed: [],
			tags: [],
			activeTags: [],
			activeApp: null,
			forceSearch: false,
			installationActionTaken: null
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.addedAppsChanged = this.addedAppsChanged.bind(this);
		this.filteringApps = this.filteringApps.bind(this);
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
	}

	componentWillMount() {
		//For more information on async react rendering, see here
		//https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html

		this._asyncAppRequest = storeActions.getApps().then(apps => {
			this.setState({
				apps
			});
		});

		this._asyncTagsRequest = storeActions.getTags().then(tags => {
			this.setState({
				tags
			});
		});
	}

	componentDidMount() {
		getStore().addListener({ field: "appDefinitions" }, this.addedAppsChanged);
		getStore().addListener({ field: "filteredApps" }, this.filteringApps);
		getStore().addListener({ field: "activeTags" }, this.filteringApps);
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
		getStore().removeListener({ field: "filteredApps" }, this.filteringApps);
		getStore().removeListener({ field: "activeTags" }, this.filteringApps);
		getStore().removeListener({ field: "activeApp" }, this.openAppShowcase);
		// Get notified when user wants to view an app
		FSBL.Clients.RouterClient.removeListener("viewApp", this.viewApp);

		//Make sure async requests have finished.
		if (this._asyncAppRequest) {
			this._asyncAppRequest.cancel();
		}

		if (this._asyncTagsRequest) {
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
				setTimeout(this.stopShowingInstalledNotification, 3000);
			});
		}
	}

	/**
	 * The store has pushed an update to the filtered tags list. This means a user has begun searching or added tags to the filter list
	 */
	filteringApps() {
		let { filteredApps, activeTags, activeApp } = this.state;
		let apps = storeActions.getFilteredApps();
		let tags = storeActions.getActiveTags();

		//Make sure a change actually occured before rerendering. If the store's activeTags or filteredApps is different then component's, we make a change (which triggers a page change). Otherwise don't.
		//NOTE: The potential bug here is if filteredApps or activeTags has somehow changed and maintained the same length (which should be impossible)
		if ((apps && filteredApps && activeTags && tags) && (apps.length !== filteredApps.length || activeTags.length !== tags.length)) {
			this.setState({
				filteredApps: apps,
				activeTags: tags,
				activeApp: (apps.length !== 0 && tags.length !== 0) ? null : activeApp
			});
		}
	}
	/**
	 * Determines the apps page based on the state of the activeTags, search text, etc
	 */
	determineActivePage() {
		let { activeApp, filteredApps, activeTags, forceSearch } = this.state;
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
		storeActions.clearTags();
		storeActions.clearFilteredApps();
		storeActions.clearApp();
		this.setState({
			activeApp: null,
			forceSearch: false
		});
	}
	/**
	 * Performs a search through the catalog
	 * @param {string} search The text to search the catalog with
	 */
	changeSearch(search) {
		storeActions.searchApps(search, () => {

			this.setState({ forceSearch: (search !== "") });
		});
	}
	/**
	 * When the notification for isntalling/removing an app is shown a timeout is set to call this function to cease showing the notification
	 */
	stopShowingInstalledNotification() {
		this.setState({
			installationActionTaken: null,
			activeApp: storeActions.getActiveApp()
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
			storeActions.clearTags();
			storeActions.clearFilteredApps();
			this.setState({
				activeApp: app,
				forceSearch: false
			});
		}
	}
	/**
	 * Compiles a list of apps that are installed from the information recieved back from appd
	 * and the information contained on the system
	 * TODO: This is temporary. It will change when there is actually a way to know from launcher what apps are installed, and which are not
	 * @param {boolean} filtered If true, uses the filtered apps array. Otherwise uses all apps
	 */
	compileAddedInfo(filtered) {
		let { installed, forceSearch } = this.state;
		let apps;
		if (filtered || forceSearch) {
			apps = this.state.filteredApps;
		} else {
			apps = this.state.apps;
		}

		apps = apps.map((app) => {
			for (let i = 0; i < installed.length; i++) {
				if (installed.includes(app.appId)) {
					app.installed = true;
				} else {
					app.installed = false;
				}
			}
			return app;
		});
		return apps;
	}
	getPageContents() {
		let { filteredApps, activeTags } = this.state;
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
					return this.state.activeApp === app.appId;
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

		let { tags, activeTags } = this.state;
		let page = this.determineActivePage();
		let pageContents = this.getPageContents();

		return (
			<div>
				<SearchBar hidden={page === "showcase" ? true : false} backButton={page !== "home"} tags={tags} activeTags={activeTags} tagSelected={this.addTag}
					removeTag={this.removeTag} goHome={this.goHome} installationActionTaken={this.state.installationActionTaken}
					search={this.changeSearch} isViewingApp={this.state.activeApp !== null} />
				<div className="market_content">
					{pageContents}
				</div>
			</div>
		);
	}
}

FSBL.addEventListener("onReady", function () {
	createStore((store) => {
		storeActions.initialize(() => {
			ReactDOM.render(
				<AppMarket />,
				document.getElementById("bodyHere"));
		});
	});
});