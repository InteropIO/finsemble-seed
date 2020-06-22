import * as React from "react";
import INotification from "../../../types/Notification-definitions/INotification";
import { format, parseISO } from "date-fns";

interface TableProps {
	children?: React.PropsWithChildren<any>;
	notifications: Array<INotification>;
	setActiveNotification: Function;
}

interface RowProps {
	notification?: INotification;
	setActiveNotification: Function;
}

const NotificationRow = (props: RowProps) => {
	const { useState } = React;
	const { notification } = props;

	const [expandedField, toggleIdField] = useState(false);

	const idClass = expandedField ? null : "id";

	return (
		<div
			className="notification-center__notifications__rows"
			key={notification.id}
			onClick={() => props.setActiveNotification(notification)}
		>
			<div
				className={idClass}
				title={notification.id}
				onMouseOver={() => toggleIdField(!expandedField)}
				onMouseLeave={() => toggleIdField(!expandedField)}
			>
				{notification.id}
			</div>
			<div>{notification.title} </div>
			<div>{notification.headerText} </div>
			<div>{format(parseISO(notification.issuedAt), "yyyy-MM-dd' at 'HH:mm:ss")}</div>
			<div>{notification.type} </div>
		</div>
	);
};

const NotificationsPanel = (props: TableProps) => {
	const { setActiveNotification } = props;

	return (
		<section id="notification-center__notifications">
			<div className="notification-center__notifications__rows">
				<h4>ID</h4>
				<h4>Title</h4>
				<h4>Header Text</h4>
				<h4>Created</h4>
				<h4>Type</h4>
			</div>

			{props.notifications.map((notification: INotification, i: number) => (
				<NotificationRow key={i} notification={notification} setActiveNotification={setActiveNotification} />
			))}
		</section>
	);
};

export default NotificationsPanel;
