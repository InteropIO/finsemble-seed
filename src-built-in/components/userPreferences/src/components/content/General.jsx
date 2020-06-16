import React from "react";
import { Store as UserPreferencesStore } from "../../stores/UserPreferencesStore";
import ScheduledRestart from "../general/ScheduledRestart";
export default class General extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div>
				<ScheduledRestart />
			</div>
		);
	}
}
