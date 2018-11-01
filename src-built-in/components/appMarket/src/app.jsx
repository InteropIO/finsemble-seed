/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
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
			activePage: "home",
			activeApp: null,
			installationActionTaken: null
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.tagsChanged = this.tagsChanged.bind(this);
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
		getStore().addListener({ field: 'activeTags' }, this.tagsChanged);
		getStore().addListener({ field: 'installed' }, this.stopShowingInstalledNotification);
		getStore().addListener({ field: 'filteredApps' }, this.filteringApps);
	}
	componentWillUnmount() {
		getStore().removeListener({ field: 'activeTags' }, this.tagsChanged);
		getStore().removeListener({ field: 'filteredApps' }.this.filteringApps);
		getStore().removeListener({ field: 'installed' }, this.stopShowingInstalledNotification);
	}
	/**
	 * Enacted when the stores 'activeTags' are changed. This means a search has begun (since a filter was added)
	 */
	tagsChanged() {
		let { activePage: page } = this.state;
		let tags = storeActions.getActiveTags();

		//If this call was actually _removing_ a tag, and its the last tag, and there is no search text, we want to go back home. (No longer want to view the AppResults)
		if (tags.length === 0) {
			page = "home";
		}

		this.setState({
			activeTags: tags,
			activePage: page
		});
	}
	/**
	 * The store has pushed an update to the filtered tags list. This means a user has begun searching or added tags to the filter list
	 */
	filteringApps() {
		this.setState({
			filteredApps: storeActions.getFilteredApps()
		});
	}
	/**
	 * Determines the apps page based on the state of the activeTags, search text, etc
	 */
	determineActivePage() {
		let tags = storeActions.getActiveTags();
		let filteredApps = storeActions.getFilteredApps();

		if (filteredApps.length > 0) {
			return "appSearch";
		} else if (filteredApps.length === 0 && tags.length === 0) {
			return "home";
		}
	}
	/**
	 * Calls the store to add a tag to the activeTag list. Also updates the app view to switch to the AppResults page (since adding a tag implies filtering has begun)
	 * @param {string} tag The name of the tag to add
	 */
	addTag(tag) {
		storeActions.addTag(tag);

		this.setState({
			activePage: this.determineActivePage()
		});
	}
	/**
	 * Calls the store to remove a tag from the activeTag list. Also updates the app view to switch to the homepage if all tags have been removed
	 * @param {string} tag The name of the tag to add
	 */
	removeTag(tag) {
		storeActions.removeTag(tag);

		this.setState({
			activePage: this.determineActivePage()
		});
	}
	/**
	 * Action to take when the back button is clicked (which just goes home)
	 */
	goHome() {
		storeActions.clearTags();
		storeActions.clearFilteredApps();
		this.setState({
			activePage: this.determineActivePage(),
			activeApp: null
		});
	}
	/**
	 * Performs a search through the catalog
	 * @param {string} search The text to search the catalog with
	 */
	changeSearch(search) {
		storeActions.clearFilteredApps();
		if (search !== "") {
			storeActions.searchApps(search);
		}
		this.setState({
			activePage: this.determineActivePage()
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
		let { installed } = this.state;
		let apps;
		if (filtered) {
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
		let { activePage, filteredApps } = this.state;
		let apps = this.compileAddedInfo((filteredApps.length > 0));

		if (apps.length > 0) {
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
		} else {
			return (
				<div></div>
			);
		}
	}
	render() {

		let { tags, activeTags } = this.state;
		let pageContents = this.getPageContents();

		return (
			<div>
				<SearchBar backButton={this.state.activePage !== "home"} tags={tags} activeTags={activeTags} tagSelected={this.addTag} removeTag={this.removeTag} goHome={this.goHome} changeSearch={this.changeSearch} installationActionTaken={this.state.installationActionTaken} />
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