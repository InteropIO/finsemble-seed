/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/

import React from "react";
import ReactDOM from "react-dom";
//Finsemble font-icons, general styling, and specific styling.
import "../searchMenu.css";
import "../../../../assets/css/font-finance.css";
import "../../../../assets/css/finsemble.css";
import ComponentItem from "./components/componentItem";
import ProviderList from "./components/ProviderList";
import * as storeExports from "./stores/searchStore";
import * as _throttle from "lodash.throttle"

let menuStore;

/**
 * This is our application launcher. It is opened from a button in our sample toolbar, and it handles the launching of finsemble components.
 *
 * @class AppLauncher
 * @extends {React.Component}
 */
class SearchMenu extends React.Component {
	constructor(props) {
		super(props);
		this.buildList = this.buildList.bind(this);

		this.keyPress = this.keyPress.bind(this);
		this.state = {
			componentList: [],
			activeRecord: -1
		};
		this.fitToDOM = _throttle(this.fitToDOM, 200);
	}
	componentDidUpdate() {
		var element = document.getElementsByClassName("active")[0]
		if (!element) return;
		if (this.state.newList) {//We don't need to scroll to the active element if we have a new list
			this.fitToDOM();
			return this.setState({ newList: false, prev: true });
		}
		element.scrollIntoView(false, { block: "center" });
	}
	shouldComponentUpdate(nextProps, nextState) {

		if (this.state.newList && !nextState.newList) {//This allows us to scroll to the top on a new list
			return false;
		}
		return true;
	}
	fitToDOM() {
		FSBL.Clients.WindowClient.fitToDOM({ maxHeight: 500 }, function () {
			document.body.scrollTop = document.documentElement.scrollTop = 0;
		});

	}
	componentDidMount() {
		this.fitToDOM();
	}
	componentWillMount() {
		var self = this;
		storeExports.Store.addListener({ field: "list" }, function (err, data) {
			let FTD = true;
			if (data.value.length === self.state.componentList.length) {
				FTD = false;
			}
			self.setState({
				newList: true,
				pref: false,
				componentList: data.value || []
			}, () => {
				if (FTD) self.fitToDOM();
			});
		})
		window.addEventListener("keydown", self.keyPress.bind(self), true)
		storeExports.Actions.setActionPress(function (direction) {
			if (direction === "ArrowDown") {
				self.setState({ activeRecord: ++self.state.activeRecord })
			}
			if (direction === "ArrowUp") {
				if (self.state.activeRecord === -1) return;
				self.setState({ activeRecord: --self.state.activeRecord })
			}
			if (direction === "Enter") {
				self.listItemClick(self.activeComponent.props.item, self.activeComponent.props.item.actions[0]);
				self.setState({
					componentList: [],
					activeRecord: -1
				})
			}
		})
		var self = this;
	}
	listItemClick(provider, item, action) {
		storeExports.Actions.listItemClick(provider, item, action);
		finsembleWindow.blur();
		finsembleWindow.hide();
	}
	providerClick(provider) {
		storeExports.Actions.providerItemClick(provider);
	}
	getBestMatch() {
		var bestMatch = null;
		this.state.componentList.map(function (providerInfo, index) {
			providerInfo.data.map(function (component, index) {
				var isBestMatch = !bestMatch || component.score < bestMatch.score;
				if (isBestMatch) bestMatch = { component: component, score: component.score, index: index, provider: providerInfo.provider.displayName };
			})
		});
		return bestMatch;
	}
	keyPress(event) {
		var events = ["ArrowUp", "ArrowDown", "Enter"]
		if (events.includes(event.key)) {
			storeExports.Actions.actionPress(null, { data: event.key })
		}

	}
	buildList() {
		if (!this.state.componentList) return null;
		var self = this;
		var listElements = [];
		var bestMatch = this.getBestMatch();//We need to find this ahead of time so that we don't render the best match in multiple locations
		var totalElements = 0;// So we can decide if we want to use best match
		var componentIndex = -1;
		this.state.componentList.map(function (providerInfo, providerIndex) {
			if (!providerInfo.data.length) return;

			var elementList = providerInfo.data.map(function (component, index) {
				totalElements++
				var isBestMatch = false;
				var currentIndex = ++componentIndex;
				if (providerInfo.provider.displayName === bestMatch.provider && bestMatch.component.name) {
					isBestMatch = true;
					componentIndex--;
					currentIndex = -1;
				}
				var isActive = self.state.activeRecord === currentIndex;
				var item = <ComponentItem isBestMatch={isBestMatch} isActive={isActive ? true : false} ref={"item" + index} key={"comp" + index}
					onClick={self.listItemClick}
					item={component} />
				if (isActive) {
					self.activeComponent = item;
				}
				if (isBestMatch) {
					bestMatch.component = item;
					return;
				}

				return item;
			})
			//Don't show provider if there are no items or the only item is the best match
			var showProvider = (!elementList.length || (elementList.length === 1 && bestMatch.provider === providerInfo.provider.displayName)) ? false : true;
			listElements.push(
				<ProviderList onClick={self.providerClick} key={"provider." + providerIndex} providerInfo={providerInfo} displayContainter={showProvider}>
					{elementList}
				</ProviderList>
			)
		})
		if (!listElements.length) return <div className="no-results"> No Results Found</div>
		return <div >
			{(totalElements >= 1 ? <div><div className="bestMatch searchHeader">Best Match</div>
				<div>{(bestMatch ? bestMatch.component : null)}</div></div> : null)}
			{listElements}</div>;
	}
	render() {
		var self = this;
		return (<div className="searchResults">
			{this.buildList()}
		</div>);
	}
}


if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady)
}
function FSBLReady() {
	//console.log("searchMenu app onReady");
	storeExports.initialize(function (store) {
		menuStore = store;
		ReactDOM.render(
			<SearchMenu />
			, document.getElementById("bodyHere"));
	});
}
