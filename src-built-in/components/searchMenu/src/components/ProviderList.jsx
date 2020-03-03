/*!
* Copyright 2020 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";
import ComponentItem from "./componentItem";

export default class ProviderList extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.state = {
		};
	}
	bindCorrectContext() {
		this.itemClick = this.itemClick.bind(this);
	}
	itemClick() {
		this.props.onClick(this.props.providerInfo.provider)
	}

	render() {
		var providerInfo = this.props.providerInfo;
		var self = this;
		if (!this.props.displayContainter) return null;
		return <div className="providerContainer" >
			<div className="provider">
				<div className="searchHeader">
					{providerInfo.provider.displayName}

				</div>

				{(providerInfo.provider.providerActionCallback && providerInfo.provider.providerActionTitle ? <div className="providerAction" >
					<div onClick={this.itemClick} className="actionTitle">{(providerInfo.provider.providerActionCallback ? providerInfo.provider.providerActionTitle : null)}</div>
					<div className="ff-arrow-right arrow_right_grey" ></div>
				</div> : null)}
			</div>
			{this.props.children}
		</div>
	}
}