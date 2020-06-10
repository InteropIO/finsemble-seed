import * as React from "react";
import useNotifications from "../shared/hooks/useNotifications";
import DragHandleIcon from "../shared/components/icons/DragHandleIcon";
import NotificationIcon from "../shared/components/icons/NotificationIcon";
import CenterIcon from "../shared/components/icons/CenterIcon";
import SettingsIcon from "../shared/components/icons/settings";
import _get = require("lodash/get");
import { usePubSub } from "../shared/hooks/finsemble-hooks";

const { useEffect, useState } = React;

function App(): React.ReactElement {
	const { notifications, activeNotifications } = useNotifications();
	const pubSubTopic = "notification-ui";
	const [notificationSubscribeMessage, notificationsPublish] = usePubSub(pubSubTopic);
	const [currentMonitor, setCurrentMonitor] = useState(null);

	useEffect(() => {
		const hotkey = _get(FSBL.Clients.WindowClient.getSpawnData(), "notifications.hotkey", null);
		console.log(hotkey);
		// TODO: Pull this out of the component into a hook
		if (hotkey) {
			FSBL.Clients.HotkeyClient.addGlobalHotkey(hotkey, () => {
				FSBL.Clients.WindowClient.showAtMousePosition();
			});
		}
		return () => {
			// cleanup;
		};
	}, []); // eslint-disable-line

	// show or hide the notifcation-drawer
	const toggleDrawer = () => {
		const { showDrawer } = notificationSubscribeMessage;
		const publishValue = { ...notificationSubscribeMessage };
		publishValue.showDrawer = !showDrawer;
		// send a message over the router like "{...,showDrawer:true}"
		notificationsPublish(publishValue);
	};

	// Show or hide the notification-center
	// use this to use the buttons to either be highlighted
	const toggleCenter = async () => {
		const { showCenter = true } = notificationSubscribeMessage;
		const publishValue = { ...notificationSubscribeMessage };
		publishValue["showCenter"] = !showCenter;

		// check if the center has been launched if not then launch it
		const { data: windows }: any = await FSBL.Clients.LauncherClient.getActiveDescriptors();
		if ("notification-center" in windows) {
			// send a message over the router like "{...,showCenter:true}"
			notificationsPublish(publishValue);
		} else {
			FSBL.Clients.LauncherClient.spawn("notification-center", {});
		}
	};

	const moveComponentsToToasterMonitor = () => {
		// get the monitor if it has changed then send a command to change the window of both the drawer and the toasts.
		const { whichMonitor: toasterMonitor } = FSBL.Clients.WindowClient.getMonitorInfo(
			{
				monitor: "mine"
			},
			console.log
		) as any;

		if (currentMonitor !== toasterMonitor) {
			// if the toaster has moved monitors send the message to the drawer and toast to move to new monitor.
			console.log(toasterMonitor);
			const publishValue = { ...notificationSubscribeMessage };
			publishValue["monitor"] = toasterMonitor;
			notificationsPublish(publishValue);
		}
		// TODO: finish the function that moves the drawer and toasts to the same monitor as the toaster
		//! This is Sidd's example - feel free to finish :D
		// (e: any, monitor: any) => {
		// 	component.setBounds(
		// 		{
		// 			top: monitor.availableRect.top,
		// 			left: monitor.availableRect.right - 320,
		// 			height: monitor.availableRect.height,
		// 			width: 320
		// 		},
		// 		(err: any) => {
		// 			console.log(err);
		// 		}
		// 	);
		// 	component.show();
		// }
	};

	const onmousedown = (e: any) => {
		console.log("startmoving", e.nativeEvent);
		(FSBL.Clients.WindowClient as any).startMovingWindow(e.nativeEvent);
	};
	const onmouseup = () => {
		console.log("stopmoving");
		(FSBL.Clients.WindowClient as any).stopMovingWindow();
		moveComponentsToToasterMonitor();
	};

	return (
		<>
			<div onMouseDown={onmousedown} onMouseUp={onmouseup}>
				<DragHandleIcon id="drag-area" className="drag-area" />
			</div>
			{activeNotifications(notifications).length > 0 && (
				<div id="notification-number">{activeNotifications(notifications).length}</div>
			)}
			<NotificationIcon
				className={notificationSubscribeMessage.showDrawer ? "toaster-icons--active" : "toaster-icons"}
				onClick={() => toggleDrawer()}
			/>
			<CenterIcon className="toaster-icons" onClick={toggleCenter} />
			{/* <div id="toaster-divider"></div>
			<SettingsIcon className="toaster-icons" /> */}
		</>
	);
}

export default App;
