import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import INotification from "../../../types/Notification-definitions/INotification";
import IAction from "../../../types/Notification-definitions/IAction";

interface Props {
	children?: React.PropsWithChildren<any>;
	notification: INotification;
	doAction: Function;
	closeAction?: Function;
	closeButton?: boolean;
	onMouseLeave?: Function;
	onMouseEnter?: Function;
}

const HeaderArea = (props: Props) => {
	const { useEffect, useState } = React;
	const { closeAction, closeButton = false, notification } = props;
	const { issuedAt = new Date() } = notification;

	const [time, setTime] = useState(
		formatDistanceToNow(new Date(issuedAt), {
			includeSeconds: true
		})
	);

	useEffect(() => {
		const id = setInterval(() => {
			setTime(
				formatDistanceToNow(new Date(issuedAt), {
					includeSeconds: true
				})
			);
		}, 10000);
		return () => clearInterval(id);
	});

	return (
		<div className="detail-area">
			<div>
				<img src={notification.headerLogo} />
			</div>
			<div className="detail-area_type">{notification.headerText}</div>
			<div className="detail-area_time">{time} ago</div>
			{closeButton && <img src="../shared/assets/close.svg" id="close-icon" onClick={() => closeAction()} />}
		</div>
	);
};

const ContentArea = (props: Props) => {
	const { notification } = props;

	return (
		<div className="content-area">
			<div>
				<img src={notification.contentLogo} />
			</div>
			<div>
				<h2>{notification.title}</h2>
				<p>{notification.details}</p>
			</div>
		</div>
	);
};

const ActionArea = (props: Props) => {
	const { doAction, notification } = props;

	return (
		<div className="action-area">
			{notification.actions.map((action: IAction) => (
				<button
					key={action.buttonText}
					onClick={e => {
						e.preventDefault();
						doAction(notification, action);
					}}
				>
					{action.buttonText}
				</button>
			))}
		</div>
	);
};

const Notification = (props: Props) => {
	const { notification } = props;
	const { meta } = notification;

	return (
		<div
			className={`notification ${notification.cssClassName || ""}`}
			onMouseEnter={() => props.onMouseEnter && props.onMouseEnter()}
			onMouseLeave={() => props.onMouseLeave && props.onMouseLeave()}
		>
			<HeaderArea {...props} />
			<ContentArea {...props} />
			<hr />
			<ActionArea {...props} />
		</div>
	);
};

export default Notification;
