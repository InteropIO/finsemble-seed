/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
import React, { Component } from "react";

//data
import storeActions from '../stores/storeActions';

/**
 * The card that displays on any page with information about an app. Clicking on it will lead to the AppShowcase or install (if the check is clicked)
 * @param {object} props Component props
 * @param {object} props...card The entire object that belongs to a single app. See FDC app directory.
 * @param {boolean} props.entitled If true, the app cannot be installed by this user, only viewed
 * @param {boolean} props.installed If true the app is installed on this local fsbl
 */
class AppCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			checkShown: this.props.installed === true ? true : false,
			checkHighlighted: false,
			awaitingInstall: false,
			toggleCheckAfterAction: false,
			titleUnderlined: false,
			appName: this.props.title || this.props.name,
			id: this.props.appId,
			entitled: this.props.entitled ? this.props.entitled : false,
			tags: this.props.tags
		};
		this.bindCorrectContext();
	}
	bindCorrectContext() {
		this.toggleHighlight = this.toggleHighlight.bind(this);
		this.toggleTitleUnderline = this.toggleTitleUnderline.bind(this);
		this.showCheck = this.showCheck.bind(this);
		this.hideCheck = this.hideCheck.bind(this);
		this.openAppShowcase = this.openAppShowcase.bind(this);
		this.addApp = this.addApp.bind(this);
		this.removeApp = this.removeApp.bind(this);
		this.addTag = this.addTag.bind(this);
	}
	componentDidMount() {
		const list = this.tagNamesList;
		const footer = this.footer;
		if (list.offsetHeight >= footer.scrollHeight + 5) {
			let newTags = this.state.tags.slice(0, 2);
			newTags.push("more");
			this.setState({
				tags: newTags
			});
		}
	}
	/**
	 * Toggles the highlight state of the check mark for installing an app
	 */
	toggleHighlight() {
		this.setState({
			checkHighlighted: !this.state.checkHighlighted
		})
	}
	/**
	 * Toggles the 'highlight' state of the app title. On mouse over, the title is underlined to show that its a link
	 */
	toggleTitleUnderline() {
		this.setState({
			titleUnderlined: !this.state.titleUnderlined
		});
	}
	/**
	 * Shows the check mark for adding/removing an app
	 */
	showCheck() {
		this.setState({
			checkShown: true
		});
	}
	/**
	 * Hides the check mark for adding/removing an app
	 */
	hideCheck() {
		if (this.state.awaitingInstall) {
			// If an add/remove is taking place and this is called, toggle the check after the action completes
			this.setState({
				toggleCheckAfterAction: true
			});
		} else {
			//Don't hide if installed. Stay green and showing
			if (!this.props.installed) {
				this.setState({
					checkShown: false
				});
			}
		}
	}
	/**
	 * Calls parent passed function to open the app showcase for the supplied app
	 */
	openAppShowcase() {
		this.props.viewAppShowcase(this.state.id);
	}
	/**
	 * Prevents bubbling (which would open the app showcase), then calls to add an app
	 * @param {object} e React Synthetic event
	 */
	addApp(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			awaitingInstall: true
		}, () => {
			storeActions.addApp(this.state.id, (err) => {
				this.setState({
					awaitingInstall: false
				});
			});
		});
	}
	/**
	 * Prevents bubbling (which would open the app showcase), then calls to remove an app
	 * @param {object} e React Synthetic event
	 */
	removeApp(e) {
		e.preventDefault();
		e.stopPropagation();
		this.setState({
			awaitingInstall: true
		}, () => {
			storeActions.removeApp(this.state.id, (err) => {
				if (this.state.toggleCheckAfterAction) {
					this.setState({
						awaitingInstall: false,
						toggleCheckAfterAction: false,
						checkShown: !this.state.checkShown
					});
				} else {
					this.setState({
						awaitingInstall: false
					});
				}
			});
		});
	}
	/**
	 * Prevents bubbling (which would open the app showcase), then calls to add a filtering tag
	 * @param {string} name The tag name to add
	 * @param {object} e React Synthetic event
	 */
	addTag(name, e) {
		e.preventDefault();
		e.stopPropagation();
		storeActions.addTag(name);
	}
	render() {
		let imageUrl = this.props.images !== undefined ? this.props.images[0].url : "../assets/placeholder.svg";

		let { appName, checkShown, checkHighlighted } = this.state;

		let imageIconClasses = "ff-check-mark-2";
		if (this.props.installed || checkHighlighted) imageIconClasses += " highlighted"
		else imageIconClasses += " faded";

		let titleClass = this.state.titleUnderlined ? "app-title highlighted" : "app-title";

		let entitled = this.state.entitled ? " entitled" : "";

		let appAction = this.props.installed ? this.removeApp : this.addApp;

		return (
			<div className='app-card' onClick={this.openAppShowcase} onMouseEnter={this.showCheck} onMouseLeave={this.hideCheck}>
				<div className="app-image-container">
					{!entitled || !checkShown ? null : <i className={imageIconClasses} onMouseEnter={this.toggleHighlight} onMouseLeave={this.toggleHighlight} onClick={appAction}></i>}
					<img className={'app-image' + entitled} src={imageUrl} />
					<div className={titleClass} onMouseEnter={this.toggleTitleUnderline} onMouseLeave={this.toggleTitleUnderline}>{appName}</div>
				</div>
				<div className='footer' ref={(el) => { this.footer = el; }}>
					<span className={"app-tags" + entitled}>
						<i className="ff-tag"></i>
						<span className='tag-names' ref={(el) => { this.tagNamesList = el; }}>
							{this.state.tags.map((tag, i) => {
								if (tag === "more") {
									return (
										<span key={3} className='tag-name' style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={this.openAppShowcase}>
											More
										</span>
									);
								}

								return (
									<span key={i} className='tag-name' onClick={this.addTag.bind(this, tag)}>
										{tag[0].toUpperCase() + tag.substring(1)}{i !== this.props.tags.length - 1 ? ", " : null}
									</span>
								);
							})}
						</span>
					</span>
				</div>
			</div>
		);
	}
}

export default AppCard;