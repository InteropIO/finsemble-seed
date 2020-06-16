import React from "react";
import { Store, Actions } from "../stores/ProcessMonitorStore";
import ChildWindow from "./ChildWindow";
/** This component could _probably_ be removed. It's just an array of child windows. */
export default class ChildWindows extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div>
				{this.props.childWindows.map((cw, i) => {
					return <ChildWindow key={i} viewMode={this.props.viewMode} cw={cw} />;
				})}
			</div>
		);
	}
}
