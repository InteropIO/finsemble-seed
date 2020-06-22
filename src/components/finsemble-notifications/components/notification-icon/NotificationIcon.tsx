/* eslint-disable @typescript-eslint/ban-ts-ignore */
import * as React from "react";
import useNotifications from "../shared/hooks/useNotifications";
import INotification from "../../types/Notification-definitions/INotification";
import "./notification-icon.css";
import NotificationIcon from "../shared/components/icons/NotificationIcon";
const { useState, useEffect } = React;
interface Props {
	action?: Function;
}

function App(props: Props): React.ReactElement {
	const [activeNotifications, setActiveNotifications] = useState([]);
	const { notifications, groupNotificationsByType } = useNotifications();

	const { action } = props;

	useEffect(() => {
		const currentNotifications = notifications.filter(
			(notification: INotification) => !notification.isSnoozed && !notification.isRead
		);
		setActiveNotifications(currentNotifications);
	}, [notifications]);

	const iconAction = () => {
		FSBL.Clients.LauncherClient.showWindow({ windowName: "", componentType: "notification-drawer" }, {});
	};

	return (
		<>
			<span id="notification-icon_vector" onClick={iconAction}>
				<NotificationIcon width="24" height="24" viewBox="0 0 24 24" />
			</span>
			<div id="notification-icon__wrapper">
				{Object.entries(groupNotificationsByType(activeNotifications)).map(([typeName, typeValues]: [string, any]) => {
					return (
						<div className={`notification-number type-count--${typeName}`} key={typeName}>
							{typeValues.length}
						</div>
					);
				})}
			</div>
		</>
	);
}

export default App;
