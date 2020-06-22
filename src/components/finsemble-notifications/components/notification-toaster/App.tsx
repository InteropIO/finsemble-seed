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
	const [toasterMonitorPosition, settoasterMonitorPosition] = useState("0");
	const { notifications, activeNotifications } = useNotifications({ config: { notificationsHistory: true } });
	const pubSubTopic = "notification-ui";
	const [notificationSubscribeMessage, notificationsPublish] = usePubSub(pubSubTopic);
	const [count, setCount] = useState(activeNotifications(notifications).length);

	useEffect(() => {
		setCount(activeNotifications(notifications).length);
	}, [notifications]);

	useEffect(() => {
		const hotkey = _get(FSBL.Clients.WindowClient.getSpawnData(), "notifications.hotkey", null);
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

	// show or hide the notification-drawer
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
		const { showCenter = false } = notificationSubscribeMessage;
		const publishValue = { ...notificationSubscribeMessage };
		publishValue["showCenter"] = !showCenter;
		notificationsPublish(publishValue);
	};

	const setCurrentMonitor = () => {
		const monitorCallBack: StandardCallback = (err, monitorInfo) => {
			if (!err) {
				//  if monitor changed, publish the new monitor
				if (toasterMonitorPosition !== monitorInfo.position) {
					const publishValue = { ...notificationSubscribeMessage };
					publishValue["toasterMonitorPosition"] = monitorInfo.position;
					settoasterMonitorPosition(monitorInfo.position);
					notificationsPublish(publishValue);
				}
			}
		};

		FSBL.Clients.LauncherClient.getMonitorInfo({ monitor: "mine" }, monitorCallBack);
		return;
	};

	const onmousedown = (e: any) => {
		FSBL.Clients.WindowClient.startMovingWindow(e.nativeEvent);
	};
	const onmouseup = () => {
		FSBL.Clients.WindowClient.stopMovingWindow();
		setCurrentMonitor();
	};

	return (
		<>
			<div onMouseDown={onmousedown} onMouseUp={onmouseup} className="drag-container">
				<DragHandleIcon id="drag-area" className="drag-area" />
			</div>
			{count > 0 && <div id="notification-number">{count}</div>}
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
