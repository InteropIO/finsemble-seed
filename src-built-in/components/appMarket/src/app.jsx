/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React from "react";
import ReactDOM from 'react-dom';

//components
import SearchBar from './components/SearchBar';
import Home from './components/Home';
import AppResults from './components/AppResults';
import AppShowcase from './components/Showcase/AppShowcase';

//data
import { createStore, getStore } from './stores/appStore';
import storeActions from './stores/storeActions';

//style
import '../appMarket.css';

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
		this.filteringApps = this.filteringApps.bind(this);
		this.goHome = this.goHome.bind(this);
		this.addTag = this.addTag.bind(this);
		this.removeTag = this.removeTag.bind(this);
		this.changeSearch = this.changeSearch.bind(this);
		this.openAppShowcase = this.openAppShowcase.bind(this);
		this.addApp = this.addApp.bind(this);
		this.removeApp = this.removeApp.bind(this);
		this.stopShowingInstalledNotification = this.stopShowingInstalledNotification.bind(this);
		this.compileAddedInfo = this.compileAddedInfo.bind(this);
		this.getPageContents = this.getPageContents.bind(this);
		this.determineActivePage = this.determineActivePage.bind(this);
	}
	async componentDidMount() {
		this.setState({
			tags: await storeActions.getTags(),
			apps: await storeActions.getApps()
		}, () => {
			this.setState({
				installed: [this.state.apps[0].appId]
			});
		});
		getStore().addListener({ field: 'installed' }, this.stopShowingInstalledNotification);
		getStore().addListener({ field: 'filteredApps' }, this.filteringApps);
	}
	componentWillUnmount() {
		getStore().removeListener({ field: 'filteredApps' }, this.filteringApps);
		getStore().removeListener({ field: 'installed' }, this.stopShowingInstalledNotification);
	}
	/**
	 * The store has pushed an update to the filtered tags list. This means a user has begun searching or added tags to the filter list
	 */
	filteringApps() {
		let apps = storeActions.getFilteredApps();
		let tags = storeActions.getActiveTags();

		this.setState({
			filteredApps: apps,
			activeTags: tags,
			activeApp: null
		});
	}
	/**
	 * Determines the apps page based on the state of the activeTags, search text, etc
	 */
	determineActivePage() {
		let { activeApp, filteredApps, activeTags, forceSearch } = this.state;
		let page;

		if (activeApp) {
			page =  "showcase"
		} else if (filteredApps.length > 0 || forceSearch) {
			page =  "appSearch";
		} else if (filteredApps.length === 0 && activeTags.length === 0) {
			page =  "home";
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
		storeActions.clearFilteredApps();
		this.setState({
			forceSearch: (search !== "")
		}, () => {
			if (search !== "") storeActions.searchApps(search);
		});
	}
	/**
	 * Adds an app to the local finsemble instance
	 * @param {string} appName The title/name of the app
	 */
	addApp(appName) {
		// //TODO: This won't work when this comes from a dd
		this.setState({
			installationActionTaken: 'add'
		});
		storeActions.addApp(appName);
	}
	/**
	 * Removes an app from the local finsemble instance
	 * @param {string} appName The title/name of the app
	 */
	removeApp(appName) {
		// //TODO: This won't work when this comes from a db
		this.setState({
			installationActionTaken: 'remove'
		}, () => {
			storeActions.removeApp(appName);
		});
	}
	/**
	 * When the notification for isntalling/removing an app is shown a timeout is set to call this function to cease showing the notification
	 */
	stopShowingInstalledNotification() {
		let installed = storeActions.getInstalledApps();
		this.setState({
			installationActionTaken: null,
			installed
		});
	}
	/**
	 * Opens the AppShowcase page for the app supplied
	 * @param {string} appName The title/name of the app to open the showcase for
	 */
	openAppShowcase(appName) {
		storeActions.clearTags();

		let app;
		let apps = this.state.apps;
		for (let i = 0; i < apps.length; i++) {
			let thisApp = apps[i];
			let thisAppName = thisApp.title || thisApp.name;

			if (appName === thisAppName) {
				app = thisApp;
				break;
			}
		}

		if (app) {
			this.setState({
				activeApp: app,
				activePage: "showcase"
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
				if (app.appId === installed[i]) {
					app.installed = true;
					break;
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
		if (apps.length === 0 && activePage !== 'appSearch') activePage = -1;

		switch (activePage) {
			case "home":
				return (
					<Home cards={apps} openAppShowcase={this.openAppShowcase} seeMore={this.addTag} addApp={this.addApp} removeApp={this.removeApp} addTag={this.addTag} />
				);
			case "appSearch":
				return (
					<AppResults cards={apps} tags={activeTags} addApp={this.addApp} removeApp={this.removeApp} openAppShowcase={this.openAppShowcase} addTag={this.addTag} />
				);
			case "showcase":
				return (
					<AppShowcase app={this.state.activeApp} addApp={this.addApp} removeApp={this.removeApp} addTag={this.addTag} />
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
				<SearchBar backButton={page !== "home"} tags={tags} activeTags={activeTags} tagSelected={this.addTag} removeTag={this.removeTag} goHome={this.goHome} changeSearch={this.changeSearch} installationActionTaken={this.state.installationActionTaken} search={this.changeSearch} />
				<div className="market_content">
					{pageContents}
				</div>
			</div>
		);
	}
}

FSBL.addEventListener('onReady', function () {
	createStore((store) => {
		ReactDOM.render(
			<AppMarket />,
			document.getElementById('bodyHere'));
	});
});