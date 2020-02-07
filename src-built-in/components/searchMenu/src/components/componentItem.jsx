/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
/**
 * This component is the name of a component and a pin that will pin that component to all toolbars.
 *
 */
import React from "react";

export default class componentItem extends React.Component {
	constructor() {
		super();
		this.bindCorrectContext();
		this.state = {
			bestMatch: false
		};
	}
	bindCorrectContext() {
		this.deleteItem = this.deleteItem.bind(this);
	}
	deleteItem() {
		//appLauncherActions.handleRemoveCustomComponent(this.props.name);
	}
	render() {
		const { props } = this;
		const { item, isActive, onClick } = props;
		if (item.actions.length <= 1) {
			return <div title={item.name} className={'resultItem action ' + (isActive ? 'bestmatch active' : '')}>
				<div className={'resultName '} onClick={() => {
					if (!item.actions[0]) return;
					onClick(item, item.actions[0]);
				}}>
				{item.displayName || item.name}
				</div>
			</div>
		}
		return <div className={'resultItem ' + (isActive ? 'bestmatch active' : '')}>
			<div className={'resultName '}>{item.name}</div>
			<div className="actions">{(item.actions.map((action, index) => {
				return <div key={'actionbtn' + index} className='action actionButton' onClick={() => {
					onClick(item, action);
				}}>
				{action.name}
				</div>
			}))}
			</div>
		</div>
	}
}