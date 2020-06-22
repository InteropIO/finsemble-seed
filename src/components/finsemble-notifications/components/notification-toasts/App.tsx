import * as React from "react";
import Drawer from "./components/Drawer";
import Notification from "../shared/components/Notification";
import useNotifications from "../shared/hooks/useNotifications";
import INotification from "../../types/Notification-definitions/INotification";
import Animate from "../shared/components/Animate";
import { SpawnParams } from "@chartiq/finsemble/dist/types/services/window/Launcher/launcher";
import { usePubSub } from "../shared/hooks/finsemble-hooks";
import { useState } from "react";
/* eslint-disable @typescript-eslint/no-var-requires */
const _get = require("lodash.get");
const { useEffect } = React;

const WINDOW_NAME_TOASTER = "notification-toaster";

function App(): React.ReactElement {
	const [currentMonitor, setCurrentMonitor] = useState("0");
	const {
		notifications,
		doAction,
		removeNotification,
		getNotificationConfig,
		activeNotifications,
		notificationIsActive
	} = useNotifications();

	const pubSubTopic = "notification-ui";
	const [notificationSubscribeMessage, notificationsPublish] = usePubSub(pubSubTopic);

	const config = getNotificationConfig("notification-toasts");

	const windowShowParams: SpawnParams = _get(config, "config.position", {
		bottom: 0,
		right: 0,
		monitor: 0
	});

	// ensure the config and notifications have loaded before rendering the DOM
	const ready = config && notifications;

	const moveToMonitor = async () => {
		const { err, data } = (await FSBL.Clients.LauncherClient.getMonitorInfo({
			windowIdentifier: { windowName: WINDOW_NAME_TOASTER }
		})) as any;

		if (err) {
			console.error(err);
			return;
		}

		const bounds = (await finsembleWindow.getBounds({})) as any;
		const width = bounds.data.right - bounds.data.left;

		finsembleWindow.setBounds(
			{
				top: data["availableRect"]["top"],
				left: data["availableRect"]["right"] - width,
				height: data["availableRect"]["height"],
				width: width
			},
			(err: any) => {
				finsembleWindow.show(null);
				console.log(err);
			}
		);
	};

	useEffect(() => {
		if (
			currentMonitor !== notificationSubscribeMessage.toasterMonitorPosition &&
			!activeNotifications(notifications).length
		) {
			moveToMonitor().then(() => {
				setCurrentMonitor(notificationSubscribeMessage.toasterMonitorPosition);
			});
		}

		if (notifications.length === 0) {
			finsembleWindow.hide();
		} else {
			finsembleWindow.show(null);
			finsembleWindow.bringToFront();
			const rect = document.getElementById("toasts-drawer").getBoundingClientRect();
			const roundedRect = {
				x: Math.round(rect.x),
				y: Math.round(rect.y),
				width: Math.round(rect.width),
				height: Math.round(rect.height)
			};
			FSBL.Clients.WindowClient.setShape([roundedRect]);
		}
	}, [notifications, notificationSubscribeMessage]);

	return (
		<Drawer notifications={notifications} windowShowParams={windowShowParams}>
			{ready &&
				notifications.map(
					(notification: INotification) =>
						notificationIsActive(notification) && (
							// TODO: Recommend to change this to react transition group
							<Animate
								key={notification.id}
								displayDuration={notification.timeout || config.animation.displayDuration}
								animateIn={config.animation.animateIn}
								animateOut={config.animation.animateOut}
								animateOutComplete={() => removeNotification(notification)}
							>
								<Notification
									key={notification.id}
									notification={notification}
									doAction={doAction}
									closeAction={() => removeNotification(notification)}
									closeButton
									overflowCount={3}
								/>
							</Animate>
						)
				)}
		</Drawer>
	);
}

export default App;
