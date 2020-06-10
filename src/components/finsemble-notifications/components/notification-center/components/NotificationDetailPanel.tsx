import * as React from "react";
import INotification from "../../../types/Notification-definitions/INotification";
import IAction from "../../../types/Notification-definitions/IAction";

interface Props {
	children?: React.PropsWithChildren<any>;
	notification?: INotification;
	clearActiveNotification?: Function;
	doAction?: Function;
}

const NotificationsPanel = (props: Props) => {
	const {
		id,
		issuedAt,
		receivedAt,
		type,
		source,
		title,
		details,
		headerText,
		headerLogo,
		contentLogo,
		actions,
		timeout,
		meta,
		isRead,
		isSnoozed,
		actionsHistory,
		stateHistory
	} = props.notification;
	return (
		<section id="notification-center__notification-detail">
			<h3>
				Notification Detail:{" "}
				<img src="../shared/assets/close.svg" id="close-icon" onClick={() => props.clearActiveNotification(null)} />
			</h3>

			<p>ID: {id}</p>
			<p>Issued: {issuedAt}</p>
			<p>Received: {receivedAt}</p>
			<p>Type: {type}</p>
			<p>Source: {source}</p>
			<p>Title: {title}</p>
			<p>Details: {details}</p>
			<p>Header: {headerText}</p>
			<p>
				Logo: <img src={headerLogo} width="30px"></img>
			</p>
			<p>
				Content Image: <img src={contentLogo} width="30px"></img>
			</p>
			<p>
				Actions:
				{actions.map((action: IAction) => (
					<>
						<br />
						<button key={action.buttonText} onClick={() => props.doAction(props.notification, action)}>
							{action.buttonText}
						</button>
					</>
				))}
			</p>
			<p>Time out after: {timeout}</p>
			<p>Action has been performed: {isRead}</p>
			<p>Notification is snoozed: {isSnoozed}</p>
			{/* TODO: add actionsHistory and stateHistory */}
		</section>
	);
};

export default NotificationsPanel;
