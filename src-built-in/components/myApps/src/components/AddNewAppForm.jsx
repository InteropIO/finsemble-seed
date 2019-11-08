import React from "react";
import storeActions from "../stores/StoreActions";
import {
	FinsembleDialogTextInput,
	FinsembleDialogButton
} from "@chartiq/finsemble-react-controls";

const FORM_DEFAULTS = {
	name: "",
	tags: "",
	url: ""
};
const VALIDATION_DEFAULTS = {
	name: true,
	url: true
};

const INVALID_NAME_MSG = "Name cannot be empty or be a duplicate of an existing component.";
const INVALID_URL_MSG = "URL must be valid (e.g., http://www.google.com).";
/**
 * A component that has a form to accept new app properties
 * like name, url and tags, validates user input then saves it
 * to persistent store. Showing or hiding this component is up to
 * parent component.
 * @example <AddNewAppForm onDone={this.someHandlerFunction}></AddNewAppForm>
 */
export default class AddNewAppForm extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			//if you do not do this, FORM_DEFAULTS gets mutated by setState later on.
			form: Object.assign({}, FORM_DEFAULTS),
			validation: Object.assign({}, VALIDATION_DEFAULTS),
			//changed to true after the user submits (if they submit bad information). This gives updated information on keypress.
			validateOnInputChange: false
		};

		this.onSubmit = this.onSubmit.bind(this);
		this.onClear = this.onClear.bind(this);
		this.onCancel = this.onCancel.bind(this);
		this.done = this.done.bind(this);
		this.onURLChanged = this.onURLChanged.bind(this);
		this.onAppNameChanged = this.onAppNameChanged.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
	}

	/**
	 * Calls the storeActions.addApp() method
	 * to save the new app in store.
	 */
	onSubmit() {
		let validName = this.validateName(this.state.form.name);
		let validURL = this.validateURL(this.
			state.form.url);
		if (!validName || !validURL) {
			this.setState({
				validation: {
					url: validURL,
					name: validName
				},
				validateOnInputChange: true
			});
			return;
		}
		this.setState({
			validation: Object.assign({}, VALIDATION_DEFAULTS),
			validateOnInputChange: false
		});

		this.fixURL();

		storeActions.addApp(this.state.form, (error) => {
			// Notify parent if no errors
			if (error) {
				FSBL.Clients.Logger.error(error);
				this.setState({
					validation: {
						name: false,
						url: true
					}
				})
			} else {
				this.done();
			}
		});
	}
	/**
     * Clears all form inputs
     */
	onClear() {
		document.getElementById("new-app").reset();
		this.setState({
			form: Object.assign({}, FORM_DEFAULTS)
		});
	}
	/**
     * Just cancel and do not add the app
     */
	onCancel() {
		this.done();
	}
	/**
     * Calls the passed onDone property to let the parent component
     * know that we finished processing user's request (submit/cancel)
     */
	done() {
		if (this.props.onDone && typeof this.props.onDone === "function") {
			this.props.onDone();
		}
		this.onClear();
	}

	/**
	 * When the url changes, validate it (after submit), or set state.
	 * @param {keyboardEvent} e
	 */
	onURLChanged(e) {
		this.state.form.url = e.target.value;
		let { form, validation } = this.state;
		form.url = e.target.value;
		if (this.state.validateOnInputChange) {
			validation.url = this.validateURL(form.url);
		}
		this.setState({
			form
		});
	}
	/**
	 * When the name changes, validate it (after submit), or set state.
	 * @param {keyboardEvent} e
	 */
	onAppNameChanged(e) {
		let { form, validation } = this.state;
		form.name = e.target.value;
		if (this.state.validateOnInputChange) {
			validation.name = this.validateName(form.name);
		}
		this.setState({
			form
		});
	}
	/**
	 * Attempt to make a URL object, if successful the provided URL is valid.
	 * If the URL constructor determines the provided string to be invalid it throws a TypeError.
	 *
	 * @param {string} url
	 * @return boolean
	 */
	validateURL(url) {
		try {
			new URL(url);
			return true;
		} catch(e) {
			return false;
		}
	}

	/**
	 * When the url changes, validate it (after submit), or set state.
	 * @param {keyboardEvent} e
	 */
	validateName(name) {
		return !(name === "") || /^[0-9a-zA-Z_.-\s]+$/.test(name)
	}

	/**
	 * Allows user to skip the protocol. Puts one in there if they don't have it.
	 */
	fixURL() {
		let { form } = this.state;
		if (!form.url.startsWith("http") && !form.url.startsWith("https")) {
			form.url = location.protocol + "//" + form.url;
		}
		this.setState({ form });
	}

	/**
	 * Hotkey handler
	 * Escape clears the form and hides it.
	 * Enter submits.
	 * @param {} e
	 */
	onKeyDown(e) {
		if (e.key === "Escape") {
			this.onClear();
			this.done();
		}
		if (e.key === "Enter") {
			this.onSubmit();
		}
	}

	//Listen for esc/enter
	componentWillMount() {
		window.addEventListener("keydown", this.onKeyDown);
		finsembleWindow.addEventListener("blurred", this.done);
	}
	//remove listen for esc/enter
	componentWillUnmount() {
		window.removeEventListener("keydown", this.onKeyDown);
		finsembleWindow.removeEventListener("blurred", this.done);
	}

	render() {
		const form = this.state.form;
		return (<div className="add-app-form controls-wrapper">
			<form id="new-app">
				<FinsembleDialogTextInput inputLabel="App Name" onInputChange={this.onAppNameChanged} placeholder="App Name" autoFocus={true} />
				{!this.state.validation.name &&
					<div className="input-error">{INVALID_NAME_MSG}</div>}
				<FinsembleDialogTextInput inputLabel="App URL" onInputChange={this.onURLChanged} placeholder="App URL" defaultValue="https://" />
				{!this.state.validation.url &&
					<div className="input-error">{INVALID_URL_MSG}</div>}
				<div className="button-wrapper">
					<FinsembleDialogButton className="fsbl-button-neutral" onClick={this.onClear}>
						Clear
					</FinsembleDialogButton>
					<FinsembleDialogButton className="fsbl-button-neutral" onClick={this.onCancel}>
						Cancel
					</FinsembleDialogButton>
					<FinsembleDialogButton className="fsbl-button-affirmative" onClick={this.onSubmit}>
						Submit
					</FinsembleDialogButton>
				</div>
			</form>
		</div>);
	}
}
