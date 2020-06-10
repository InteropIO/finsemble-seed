import * as React from "react";
import useNotifications from "../shared/hooks/useNotifications";
import NotificationCenter from "./components/NotificationCenter";
import NotificationsPanel from "./components/NotificationsPanel";
import NotificationDetailPanel from "./components/NotificationDetailPanel";
import { usePubSub } from "../shared/hooks/finsemble-hooks";

import { useState, useEffect } from "react";

const App = (): React.ReactElement => {
	const { notifications, doAction } = useNotifications();
	const [activeNotification, setActiveNotification] = useState();
	const pubSubTopic = "notification-ui";
	const [notificationSubscribeMessage, notificationsPublish] = usePubSub(pubSubTopic);

	useEffect(() => {
		if ("showCenter" in notificationSubscribeMessage) {
			notificationSubscribeMessage.showCenter ? finsembleWindow.show(null) : finsembleWindow.hide();
		}
	}, [notificationSubscribeMessage]);

	return (
		<div id="app">
			<NotificationCenter title="Notification Center">
				<div id="main-content">
					{notifications.length === 0 ? (
						<p>You do not have any notifications!</p>
					) : (
						<>
							<NotificationsPanel notifications={notifications} setActiveNotification={setActiveNotification} />
							{activeNotification && (
								<NotificationDetailPanel
									notification={activeNotification}
									clearActiveNotification={setActiveNotification}
									doAction={doAction}
								/>
							)}
						</>
					)}
				</div>
			</NotificationCenter>
		</div>
	);
};

export default App;
