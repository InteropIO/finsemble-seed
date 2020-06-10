import * as React from "react";
import INotification from "../../../types/Notification-definitions/INotification";
import { SpawnParams } from "../../../types/FSBL-definitions/services/window/Launcher/launcher";

interface Props {
	children: React.PropsWithChildren<any>;
	notifications?: INotification[];
	windowShowParams: SpawnParams;
	onMouseEnter?: Function;
	onMouseLeave?: Function;
}

function Drawer(props: Props): React.ReactElement {
	return (
		<div onMouseEnter={() => props.onMouseEnter()} onMouseLeave={() => props.onMouseLeave()} id="toasts-drawer">
			{props.children}
		</div>
	);
}

export default Drawer;
