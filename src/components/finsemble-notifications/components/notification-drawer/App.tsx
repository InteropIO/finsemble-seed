import * as React from "react";
import Drawer from "./components/Drawer";
import Notification from "../shared/components/Notification";
import useNotifications from "../shared/hooks/useNotifications";
import INotification from "../../types/Notification-definitions/INotification";
import Animate from "../shared/components/Animate";
import { CSSTransition } from "react-transition-group";
import CenterIcon from "../shared/components/icons/CenterIcon";
import { usePubSub } from "../shared/hooks/finsemble-hooks";

const { useState, useEffect } = React;

const HideDrawer = ({ onClick }: { onClick: Function }) => (
	<img src="../shared/assets/double_arrow.svg" id="hide-icon" alt="Hide drawer Icon" onClick={() => onClick()} />
);

function App(): React.ReactElement {
	const { notifications, doAction, notificationIsActive } = useNotifications();
	const pubSubTopic = "notification-ui";
	const [notificationSubscribeMessage, notificationsPublish] = usePubSub(pubSubTopic);

	const [showDrawer, setShowDrawer] = useState(false);

	useEffect(() => {
		setShowDrawer(notificationSubscribeMessage.showDrawer);
		const rect = document.getElementById("notifications-drawer").getBoundingClientRect();
		if (notificationSubscribeMessage.showDrawer) {
			const roundedRect = {
				x: Math.round(rect.x),
				y: Math.round(rect.y),
				width: Math.round(rect.width),
				height: Math.round(rect.height)
			};
			FSBL.Clients.WindowClient.setShape([roundedRect]);
		} else {
			const roundedRect = {
				x: 0,
				y: 0,
				width: 1,
				height: 1
			};
			setTimeout(() => {
				FSBL.Clients.WindowClient.setShape([roundedRect]);
			}, 500);
		}
	}, [notificationSubscribeMessage.showDrawer]);

	const closeDrawerClick = () => {
		const publishValue = { ...notificationSubscribeMessage };
		publishValue["showDrawer"] = false;
		notificationsPublish(publishValue);
	};

	const toggleCenter = () => {
		const publishValue = { ...notificationSubscribeMessage };
		publishValue["showCenter"] = !publishValue["showCenter"];
		notificationsPublish(publishValue);
	};

	return (
		<CSSTransition in={showDrawer} timeout={500} classNames="drawer" unmountOnExit>
			<Drawer>
				<div id="notifications-drawer__menu">
					<CenterIcon id="notification-center-icon" className="notification-center-icon" onClick={toggleCenter} />
					<HideDrawer onClick={closeDrawerClick} />
				</div>
				<div>
					{notifications.length ? (
						[...notifications].map(
							(notification: INotification) =>
								notificationIsActive(notification) && (
									<Animate animateIn="slide-in-fwd-bottom" animateOut="slide-out-right" key={notification.id}>
										<Notification notification={notification} doAction={doAction} overflowCount={3} />
									</Animate>
								)
						)
					) : (
						<p className="empty-notifications">You do not have any notifications!</p>
					)}
				</div>
			</Drawer>
		</CSSTransition>
	);
}

export default App;
