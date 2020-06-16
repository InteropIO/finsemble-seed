import React from "react";
import { FinsembleButton } from "@chartiq/finsemble-react-controls";
import { ReactComponent as MinimizeAllIcon } from "../../../../assets/img/toolbar/minimize-all.svg";

const MinimizeAll = (props) => {
	const MinimizeAll = () => {
		FSBL.Clients.WorkspaceClient.minimizeAll();
	};
	let wrapperClasses = props.classes + " icon-only window-mgmt-left";

	return (
		<FinsembleButton
			className={wrapperClasses}
			buttonType={["Toolbar"]}
			title="Minimize All"
			onClick={MinimizeAll}
		>
			<span>
				<MinimizeAllIcon />
			</span>
		</FinsembleButton>
	);
};

export default MinimizeAll;
