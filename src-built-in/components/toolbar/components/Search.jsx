import React from "react";
import { FinsembleButton, FinsembleToolbarSeparator } from "@chartiq/finsemble-react-controls";
import * as storeExports from "../stores/searchStore";
import * as _debounce from "lodash.debounce"
import ToolbarStore from "../stores/toolbarStore";
import {Actions as SearchStore} from "../stores/searchStore";

let menuStore;
export default class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			ready: false,
			focus: false,
			saveText: null,
			active: false
		};
		this.bindCorrectContext();
		//Instead of accessing elements on the DOM directly (document.getElementById)
		//Since any number of elements can share that id we instead want to use built in React refs
		//More information can be found here https://reactjs.org/docs/refs-and-the-dom.html
		this.searchContainer = React.createRef();
		this.searchInput = React.createRef();
		let self = this;

		// Handler for obtaining the search inputContainer bounds for the location of the
		// search results popup, which is displayed by the SearchStore.
		SearchStore.setInputContainerBoundsHandler(this.getInputContainerBounds.bind(this));
		SearchStore.setBlurSearchInputHandler(this.blurSearchInput.bind(this));
		SearchStore.setSearchInputHandler(this.getSearchInput.bind(this));
	}
	/**
	 * Returns getBoundingClientRect of the inputContainer div element for positioning search results
	 */
	getInputContainerBounds() {
		const inputContainer = this.searchContainer.current;
		if (inputContainer) {
			return inputContainer.getBoundingClientRect();
		}
		return undefined;
	}
	blurSearchInput() {
		console.log('bluring search input');
		this.searchInput.current.blur();
	}
	getSearchInput() {
		return this.searchInput.current;
	}
	onStateUpdate(err, data) {

	}
	componentWillMount() {
		var self = this;

		storeExports.initialize(function (store) {
			menuStore = store;
			self.setState({ ready: true })
			ToolbarStore.addListener({ field: "searchActive" }, self.hotKeyActive);
			menuStore.addListener({ field: "active" }, self.setActive);
			menuStore.addListener({ field: "state" }, self.onStateUpdate);
			menuStore.Dispatcher.register(function (action) {
				if (action.actionType === "clear") {
					self.emptyInput();
				}
			});
		});
		FSBL.Clients.HotkeyClient.addGlobalHotkey([FSBL.Clients.HotkeyClient.keyMap.esc], function () {
			storeExports.Actions.handleClose()
		})
	}
	emptyInput() {
		this.setState({ saveText: this.searchInput.current.textContent });
		this.searchInput.current.innerHTML = "";
	}
	componentWillUnmount() {
		ToolbarStore.removeListener({ field: "searchActive" }, self.hotKeyActive);
		menuStore.removeListener({ field: "active" }, self.setActive);
		menuStore.removeListener({ field: "state" }, self.onStateUpdate);

	}
	textChange(e) {
		//have to do this or react will squash the event.
		e.persist();
		this.textChangeDebounced(e);
	}

	textChangeDebounced(event) {
		storeExports.Actions.search(event.target.textContent);
	}
	componentDidUpdate() {
		if (this.state.hotketSet) {
			FSBL.Clients.WindowClient.finWindow.focus(() => {
				this.searchContainer.current.focus();
				if (this.searchInput.current.innerHTML && this.searchInput.current.innerHTML.trim() !== "") {
					SearchStore.positionSearchResults();
				}
				this.setState({
					hotketSet: false
				});
			});
		}
		/*if (!this.state.focus) return;
		setTimeout(() => {///doing this instantly caused the cursor to be at the state
			//this.placeCursorOnEnd()// This is causing a focus issue.
		}, 100);*/
	}
	bindCorrectContext() {
		this.onStateUpdate = this.onStateUpdate.bind(this);
		this.focused = this.focused.bind(this);
		this.blurred = this.blurred.bind(this);
		this.keyPress = this.keyPress.bind(this);
		this.textChange = this.textChange.bind(this);
		this.textChangeDebounced = _debounce(this.textChangeDebounced, 200);
		this.setActive = this.setActive.bind(this);
		this.emptyInput = this.emptyInput.bind(this);
		this.hotKeyActive = this.hotKeyActive.bind(this);
	}
	setActive(err, data) {
		this.setState({ active: data.value })
	}
	hotKeyActive() {
		this.setState({ active: true, hotketSet: true })
	}
	focused(e) {
		function selectElementContents(el) {
			var range = document.createRange();
			range.selectNodeContents(el);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}

		storeExports.Actions.setFocus(true, e.target)

		if (this.state.hotketSet) {
			return this.setState({ focus: true, hotketSet: false })
		}

		setTimeout(function () {

			// select the old search text, so the user can edit it or type over it
			// Do this in a timeout to give some time for the animation to work
			var element = this.searchInput;
			if (element.innerHTML.trim() === "") {
				SearchStore.search("");
			} else {
				selectElementContents(element);
			}
		}, 100);
	}
	blurred() {
		storeExports.Actions.setFocus(false)
	}
	keyPress(event) {
		var events = ["ArrowUp", "ArrowDown", "Enter"]
		if (events.includes(event.key)) {
			storeExports.Actions.actionPress(event.key)
		}
	}
	render() {
		return <div ref={this.searchContainer} id="inputContainer" className="searchContainer">
			<div className="searchSection  finsemble-toolbar-button">
				<div ref={this.searchInput} id="searchInput" contentEditable className={"searchInput " + (this.state.active ? "active" : "compact")} placeholder="Search" onKeyDown={this.keyPress}
					onFocus={this.focused}
					/*onInput={this.textChange} onBlur={this.blurred} onChange={this.textChange} dangerouslySetInnerHTML={{ __html: (this.state.focus ? this.state.saveText : "") }} />*/
					onInput={this.textChange} onBlur={this.blurred} onChange={this.textChange} />
			</div>
		</div>
	}
}