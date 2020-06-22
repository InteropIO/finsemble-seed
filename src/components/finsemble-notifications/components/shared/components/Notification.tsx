import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import INotification from "../../../types/Notification-definitions/INotification";
import IAction from "../../../types/Notification-definitions/IAction";
import { useEffect, useState } from "react";

interface Props {
	children?: React.PropsWithChildren<any>;
	notification: INotification;
	doAction: Function;
	closeAction?: Function;
	closeButton?: boolean;
	onMouseLeave?: Function;
	onMouseEnter?: Function;
	OverflowMenu?: Function;
	overflowCount?: number;
}

const HeaderArea = (props: Props) => {
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
	const { notification, overflowCount } = props;

	return (
		<div className="action-area">
			{notification.actions.map((action: IAction, index) => {
				if (!overflowCount || index + 1 <= overflowCount) {
					return <UIAction key={index} {...props} action={action} />;
				}
			})}
			{overflowCount && notification.actions.length > overflowCount && (
				<OverflowMenu>
					{notification.actions.map((action: IAction, index) => {
						if (index + 1 > overflowCount) {
							return <UIAction key={index} {...props} action={action} />;
						}
					})}
				</OverflowMenu>
			)}
		</div>
	);
};

interface OverflowMenuProps {
	children?: React.PropsWithChildren<any>;
}

const OverflowMenu = (props: OverflowMenuProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggle = () => {
		setIsOpen(!isOpen);
	};

	return (
		<div className={"action-overflow " + (isOpen ? "overflow-open" : "")}>
			<div className="overflow-icon">
				<span onClick={toggle}>...</span>
				<div className="overflow-menu">{props.children}</div>
			</div>
		</div>
	);
};

interface ActionUIProps {
	action: IAction;
	doAction: Function;
	notification: INotification;
}

const UIAction = (props: ActionUIProps) => {
	const { action, doAction, notification } = props;
	return (
		<button
			key={action.buttonText}
			onClick={e => {
				e.preventDefault();
				doAction(notification, action);
			}}
		>
			{action.buttonText}
		</button>
	);
};

const Notification = (props: Props) => {
	const { notification } = props;

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
