import React from "react";
import { FinsembleButton, FinsembleToolbarSeparator } from "@chartiq/finsemble-react-controls";
import * as storeExports from "../stores/searchStore";
import * as _debounce from "lodash.debounce"
import ToolbarStore from "../stores/toolbarStore";

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
		let self = this;
	}
	onStateUpdate(err, data) {
		//this.setState({ focus: data.value, saveText: document.getElementById("searchInput").textContent })
		//if (!data.value) document.getElementById("searchInput").innerHTML = ""
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
		this.setState({ saveText: document.getElementById("searchInput").textContent });
		document.getElementById("searchInput").innerHTML = "";
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
	placeCursorOnEnd() {
		var el = document.getElementById("searchInput");
		if (typeof window.getSelection != "undefined"
			&& typeof document.createRange != "undefined") {
			var range = document.createRange();
			range.selectNodeContents(el);
			range.collapse(false);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (typeof document.body.createTextRange != "undefined") {
			var textRange = document.body.createTextRange();
			textRange.moveToElementText(el);
			textRange.collapse(false);
			textRange.select();
		}
	}
	componentDidUpdate() {
		if (this.state.hotketSet) {
			FSBL.Clients.WindowClient.finWindow.focus(() => {
				this.refs.Search.focus();
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
		this.placeCursorOnEnd = this.placeCursorOnEnd.bind(this);
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
		if (this.state.hotketSet) {
			storeExports.Actions.setFocus(true, e.target)
			return this.setState({ focus: true, hotketSet: false })
		}
		//this.setState({ focus: true });
		storeExports.Actions.setFocus(true, e.target)

		setTimeout(function () {
			
			// select the old search text, so the user can edit it or type over it
			// Do this in a timeout to give some time for the animation to work
			var element = document.getElementById("searchInput");
			selectElementContents(element);
		}, 100);
	}
	blurred() {
		//this.setState({ focus: false, saveText: document.getElementById("searchInput").textContent });
		//document.getElementById("searchInput").innerHTML = ""; // Don't clear out the old search text
		storeExports.Actions.setFocus(false)
	}
	keyPress(event) {
		var events = ["ArrowUp", "ArrowDown", "Enter"]
		if (events.includes(event.key)) {
			//if (event.key === "Enter") document.getElementById("searchInput").innerHTML = ""; // Don't clear out the old search text
			storeExports.Actions.actionPress(event.key)
		}
	}
	render() {
		return <div id="inputContainer" className="searchContainer">
			<div className="searchSection  finsemble-toolbar-button">
				<div ref="Search" id="searchInput" contentEditable className={"searchInput " + (this.state.active ? "active" : "compact")} placeholder="Search" onKeyDown={this.keyPress}
					onFocus={this.focused}
					/*onInput={this.textChange} onBlur={this.blurred} onChange={this.textChange} dangerouslySetInnerHTML={{ __html: (this.state.focus ? this.state.saveText : "") }} />*/
					onInput={this.textChange} onBlur={this.blurred} onChange={this.textChange} />
			</div>
		</div>
	}
}