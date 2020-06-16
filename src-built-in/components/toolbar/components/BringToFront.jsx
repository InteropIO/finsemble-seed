import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";
import { ReactComponent as BringToFrontIcon } from "../../../../assets/img/toolbar/bring-to-front.svg";

// Store
import ToolbarStore from "../stores/toolbarStore";

const BringToFront = (props) => {
	const BringToFront = () => {
		FSBL.Clients.LauncherClient.bringWindowsToFront({}, () => {
			ToolbarStore.bringToolbarToFront();
		});
	};
	let wrapperClasses = props.classes + " icon-only window-mgmt-right";

	return (
		<FinsembleButton
			className={wrapperClasses}
			buttonType={["Toolbar"]}
			title="Reveal All"
			onClick={BringToFront}
		>
			<span>
				<BringToFrontIcon />
			</span>
		</FinsembleButton>
	);
};

export default BringToFront;
