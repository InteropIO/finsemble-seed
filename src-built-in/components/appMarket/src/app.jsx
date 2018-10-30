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
		this.goHome = this.goHome.bind(this);
		this.addTag = this.addTag.bind(this);
		this.removeTag = this.removeTag.bind(this);
		this.changeSearch = this.changeSearch.bind(this);
		this.openAppShowcase = this.openAppShowcase.bind(this);
		this.addApp = this.addApp.bind(this);
		this.removeApp = this.removeApp.bind(this);
		this.stopShowingInstalledNotification = this.stopShowingInstalledNotification.bind(this);
	}
	async componentDidMount() {
		this.setState({
			tags: await storeActions.getTags(),
			apps: await storeActions.getApps()
		})
		getStore().addListener({ field: 'activeTags' }, this.tagsChanged);
	}
	componentWillUnmount() {
		getStore().removeListener({ field: 'activeTags' }, this.tagsChanged);
	}
	tagsChanged() {
		this.setState({
			activeTags: storeActions.getActiveTags()
		});
	}
	addTag(tag) {
		storeActions.addTag(tag);
		let tags = storeActions.getActiveTags();
		let page = this.state.activePage;

		if (tags.length === 1) {
			page = "appSearch";
		}

		this.setState({
			activePage: page
		});
	}
	removeTag(tag) {
		storeActions.removeTag(tag);
		let tags = storeActions.getActiveTags();

		let page = this.state.activePage;

		if (tags.length === 0) {
			page = "home";
		}

		this.setState({
			activePage: page
		});
	}
	goHome() {
		storeActions.clearTags();
		this.setState({
			activePage: "home",
			activeApp: null
		});
	}
	changeSearch(search) {

		// if (search || appCatalogStore.Actions.getActiveTags().length > 0) {
		// 	appCatalogStore.Actions.searchApps(search);

		// 	this.setState({
		// 		activePage: "appSearch"
		// 	});
		// } else {
		// 	appCatalogStore.Actions.clearSearchResults();

		// 	this.setState({
		// 		activePage: appCatalogStore.Actions.getActiveTags().length === 0 ? "home" : this.state.activePage
		// 	});
		// }
	}
	addApp(appName) {
		// //TODO: This won't work when this comes from a db
		// appCatalogStore.Actions.addApp(appName);

		// this.setState({
		// 	apps: appCatalogStore.Actions.getApps(),
		// 	installationActionTaken: "add"
		// }, () => {
		// 	setTimeout(this.stopShowingInstalledNotification, 1000);
		// });
	}
	removeApp(appName) {
		// //TODO: This won't work when this comes from a db
		// appCatalogStore.Actions.removeApp(appName);

		// this.setState({
		// 	apps: appCatalogStore.Actions.getApps(),
		// 	installationActionTaken: "remove"
		// }, () => {
		// 	setTimeout(this.stopShowingInstalledNotification, 1000);
		// })
	}
	stopShowingInstalledNotification() {
		this.setState({
			installationActionTaken: null
		});
	}
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
	render() {

		let { apps, tags, activeTags, activePage } = this.state;
		let filteredApps = [];

		let pageContents = <div></div>;

		if (apps.length > 0) {
			if (activePage === "home") {
				pageContents = <Home cards={apps} openAppShowcase={this.openAppShowcase} seeMore={this.addTag} addApp={this.addApp} removeApp={this.removeApp} addTag={this.addTag} />;
			} else if (activePage === "appSearch") {
				pageContents = <AppResults cards={filteredApps} tags={activeTags} addApp={this.addApp} removeApp={this.removeApp} openAppShowcase={this.openAppShowcase} addTag={this.addTag} />;
			} else if (activePage === "showcase") {
				pageContents = <AppShowcase app={this.state.activeApp} addApp={this.addApp} removeApp={this.removeApp} addTag={this.addTag} />;
			}
		}

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

fin.desktop.main(function () {
	FSBL.addEventListener('onReady', function () {
		createStore((store) => {
			ReactDOM.render(
				<AppMarket />,
				document.getElementById('bodyHere'));
		});
	});
});