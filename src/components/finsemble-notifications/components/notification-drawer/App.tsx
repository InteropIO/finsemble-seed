import * as React from "react";
import Drawer from "./components/Drawer";
import Notification from "../shared/components/Notification";
import useNotifications from "../shared/hooks/useNotifications";
import INotification from "../../types/Notification-definitions/INotification";
import Animate from "../shared/components/Animate";
import { CSSTransition } from "react-transition-group";
import CenterIcon from "../shared/components/icons/CenterIcon";
import { usePubSub, enableClickThrough, bringWindowToFront } from "../shared/hooks/finsemble-hooks";
import { FinsembleWindow } from "../../types/FSBL-definitions/common/window/FinsembleWindow";

const { useState, useEffect } = React;

const HideDrawer = ({ onClick }: { onClick: Function }) => (
	<img src="../shared/assets/double_arrow.svg" id="hide-icon" onClick={() => onClick()} />
);

function App(): React.ReactElement {
	const { notifications, doAction } = useNotifications();
	const pubSubTopic = "notification-ui";
	const [notificationSubscribeMessage, notificationsPublish] = usePubSub(pubSubTopic);

	const [showDrawer, setShowDrawer] = useState(true);

	useEffect(() => {
		if (notificationSubscribeMessage.showDrawer) {
			finsembleWindow.setOpacity({ opacity: 0 });
			finsembleWindow.show();
			const shownListener = () => {
				finsembleWindow.setOpacity({ opacity: 1 });
				setShowDrawer(true);
			};

			finsembleWindow.addEventListener("shown", shownListener);

			return () => {
				finsembleWindow.removeEventListener("shown", shownListener);
			};
		} else if (notificationSubscribeMessage.showDrawer === false) {
			setShowDrawer(false);
			finsembleWindow.hide();
		}
	}, [notificationSubscribeMessage, showDrawer]);

	const notificationIsActive = (notification: INotification) => !notification.isRead && !notification.isSnoozed;

	const hideDrawer = () => {
		setTimeout(() => notificationsPublish({ ...notificationSubscribeMessage, showDrawer: false }), 300);
	};

	return (
		<CSSTransition in={showDrawer} timeout={300} classNames="drawer" unmountOnExit>
			<Drawer onBlur={hideDrawer}>
				<div id="notifications-drawer__menu">
					<CenterIcon
						id="notification-center-icon"
						onClick={() => {
							"";
						}}
					/>
					<HideDrawer onClick={hideDrawer} />
				</div>
				<div>
					{notifications.length ? (
						[...notifications].map(
							(notification: INotification) =>
								notificationIsActive && (
									<Animate animateIn="slide-in-fwd-bottom" animateOut="slide-out-right" key={notification.id}>
										<Notification notification={notification} doAction={doAction}></Notification>
									</Animate>
								)
						)
					) : (
						<p>no notifications</p>
					)}
				</div>
			</Drawer>
		</CSSTransition>
	);
}

export default App;
