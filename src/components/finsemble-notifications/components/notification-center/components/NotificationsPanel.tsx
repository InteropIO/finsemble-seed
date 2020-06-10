import * as React from "react";
import INotification from "../../../types/Notification-definitions/INotification";
import { format, parseISO } from "date-fns";

interface Props {
	children?: React.PropsWithChildren<any>;
	notifications: Array<INotification>;
	setActiveNotification: Function;
}

const NotificationsPanel = (props: Props) => (
	<section id="notification-center__notifications">
		<div className="notification-center__notifications__rows">
			<h4>ID</h4>
			<h4>Title</h4>
			<h4>Header Text</h4>
			<h4>Created</h4>
			<h4>Type</h4>
		</div>

		{props.notifications.map((notification: INotification) => (
			<div
				className="notification-center__notifications__rows"
				key={notification.id}
				onClick={() => props.setActiveNotification(notification)}
			>
				<div>{notification.id}</div>
				<div>{notification.title} </div>
				<div>{notification.headerText} </div>
				<div>{format(parseISO(notification.issuedAt), "yyyy-MM-dd' at 'HH:mm:ss")}</div>
				<div>{notification.type} </div>
			</div>
		))}
	</section>
);

export default NotificationsPanel;
