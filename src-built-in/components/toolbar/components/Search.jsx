import React from "react";
import {
	FinsembleButton,
	FinsembleToolbarSeparator,
} from "@chartiq/finsemble-react-controls";
import * as storeExports from "../stores/searchStore";
import * as _debounce from "lodash.debounce";
import ToolbarStore from "../stores/toolbarStore";

let menuStore;
export default class Search extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			ready: false,
			focus: false,
			saveText: "",
			active: false,
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
		storeExports.Actions.setInputContainerBoundsHandler(
			this.getInputContainerBounds.bind(this)
		);
		storeExports.Actions.setBlurSearchInputHandler(
			this.blurSearchInput.bind(this)
		);

		//Handler to get the input where search terms are actually entered
		storeExports.Actions.setSearchInputHandler(this.getSearchInput.bind(this));

		//Sets the handler for menu blurring
		storeExports.Actions.setSearchMenuBlurHandler(this.meunBlur.bind(this));
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
		this.searchInput.current.blur();
	}
	getSearchInput() {
		let response;
		if (
			this.searchInput.current.innerHTML &&
			this.searchInput.current.innerHTML.trim() !== ""
		) {
			response = this.searchInput.current.innerHTML.trim();
		} else {
			response = "";
		}
		return response;
	}
	meunBlur() {
		mouseInElement(this.searchInput.current, function(err, inBounds) {
			if (!inBounds) {
				// Sometimes storeExports.Actions.handleClose is invoked
				// before the onClick handler inside searchMenu/componentitem.jsx
				// which is preventing the onClick handler which from firing.
				// A search result item's click handler must have the highest priority
				// otherwise clicking on search results to spawn a component will fail.
				// I really hate setTimeout, but it shouldn't have any side effects here.
				setTimeout(storeExports.Actions.handleClose, 300);
			}
		});
	}
	onStateUpdate(err, data) {}
	componentWillMount() {
		var self = this;

		storeExports.initialize(function(store) {
			menuStore = store;
			self.setState({ ready: true });
			ToolbarStore.addListener({ field: "searchActive" }, self.hotKeyActive);
			menuStore.addListener({ field: "active" }, self.setActive);
			menuStore.addListener({ field: "state" }, self.onStateUpdate);
			menuStore.Dispatcher.register(function(action) {
				if (action.actionType === "clear") {
					self.emptyInput();
				}
			});
		});
		FSBL.Clients.HotkeyClient.addGlobalHotkey(
			[FSBL.Clients.HotkeyClient.keyMap.esc],
			function() {
				storeExports.Actions.handleClose();
			}
		);
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
		// The event.nativeEvent is of type 'InputEvent'. nativeEvent.data gives us new keys that were added
		// If the user presses enter, this event will still trigger, but there's no data.
		// If the user is using hotkeys to scroll through search results and they hit enter, we don't want to search,
		// as that will position the search results.
		// So if the data is null, we skip the search.
		if (event.nativeEvent.data) {
			storeExports.Actions.search(event.target.textContent);
		}
	}
	componentDidUpdate() {
		if (this.state.hotkeySet) {
			FSBL.Clients.WindowClient.finWindow.focus(() => {
				this.searchContainer.current.focus();

				//After focusing the container (which causes the results to show) we want to position the results. This way if the toolbar was moved with a keyboard shortcut, the results will follow it. Avoid doing this when the search text is empty since we don't want to show the 'No results found'
				if (
					this.searchInput.current.innerHTML &&
					this.searchInput.current.innerHTML.trim() !== ""
				) {
					storeExports.Actions.positionSearchResults();
				}
				this.setState({
					hotkeySet: false,
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
		this.setState({ active: data.value });
	}
	hotKeyActive() {
		this.setState({ active: true, hotkeySet: true });
		this.searchInput.current.focus();
	}
	focused(e) {
		function selectElementContents(el) {
			var range = document.createRange();
			range.selectNodeContents(el);
			var sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}

		storeExports.Actions.setFocus(true, e.target);

		if (this.state.hotkeySet) {
			return this.setState({ focus: true, hotkeySet: false });
		}

		setTimeout(function() {
			// select the old search text, so the user can edit it or type over it
			// Do this in a timeout to give some time for the animation to work
			selectElementContents(this.searchInput);
		}, 100);
	}
	blurred() {
		storeExports.Actions.setFocus(false);
	}
	keyPress(event) {
		var events = ["ArrowUp", "ArrowDown", "Enter"];
		if (events.includes(event.key)) {
			storeExports.Actions.actionPress(event.key);
		}
	}
	render() {
		return (
			<div
				ref={this.searchContainer}
				id="inputContainer"
				className="searchContainer"
			>
				<div className="searchSection  finsemble-toolbar-button" title="Search">
					<div
						ref={this.searchInput}
						id="searchInput"
						contentEditable
						className={
							"searchInput " + (this.state.active ? "active" : "compact")
						}
						placeholder="Search"
						onKeyDown={this.keyPress}
						onFocus={this.focused}
						onInput={this.textChange}
						onBlur={this.blurred}
						onChange={this.textChange}
					/>
				</div>
			</div>
		);
	}
}

function mouseInElement(element, cb) {
	var elementBounds = element.getBoundingClientRect();
	var bounds = {
		top: window.screenY + elementBounds.top,
		left: window.screenX + elementBounds.left,
		bottom: element.offsetHeight + window.screenY,
		right: elementBounds.right + window.screenX + elementBounds.left,
	};
	mouseInBounds(bounds, cb);
}
function mouseInBounds(bounds, cb) {
	FSBL.System.getMousePosition(function(err, mousePosition) {
		if (
			(mousePosition.left >= bounds.left) &
			(mousePosition.left <= bounds.right)
		) {
			if (
				(mousePosition.top >= bounds.top) &
				(mousePosition.top <= bounds.bottom)
			) {
				return cb(null, true);
			}
		}
		return cb(null, false);
	});
}
