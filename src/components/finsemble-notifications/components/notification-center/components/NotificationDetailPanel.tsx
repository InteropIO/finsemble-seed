import * as React from "react";
import INotification from "../../../types/Notification-definitions/INotification";
import IAction from "../../../types/Notification-definitions/IAction";
import Meta from "../../../types/Notification-definitions/Meta";
import IPerformedAction from "../../../types/Notification-definitions/IPerformedAction";
import { ActionTypes } from "../../../types/Notification-definitions/ActionTypes";
import { formatDistanceToNow } from "date-fns";
import { stat } from "fs";

interface NotificationHeaderProps {
	issuedAt?: string;
	receivedAt?: string;
	headerLogo?: string;
	headerText?: string;
}

interface NotificationContentProps {
	title?: string;
	type?: string;
	contentLogo?: string;
	details?: string;
	timeout?: number;
	source?: string;
	meta?: Meta;
	isRead?: boolean;
	isSnoozed?: boolean;
}

interface NotificationActionsProps {
	actions?: IAction[];
	notification: INotification;
	doAction?: Function;
}

interface NotificationPanelProps {
	children?: React.PropsWithChildren<any>;
	notification?: INotification;
	clearActiveNotification?: Function;
	doAction?: Function;
}

interface NotificationHistoryProps {
	actionsHistory?: IPerformedAction[];
	stateHistory?: INotification[];
}

const HeaderArea = (props: NotificationHeaderProps) => {
	const { useState, useEffect } = React;
	const { issuedAt, receivedAt, headerLogo, headerText } = props;

	const [issuedTime, setTime] = useState(
		formatDistanceToNow(new Date(issuedAt), {
			includeSeconds: true
		})
	);

	const [receivedTime, setReceived] = useState(
		formatDistanceToNow(new Date(receivedAt), {
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
			setReceived(
				formatDistanceToNow(new Date(receivedAt), {
					includeSeconds: true
				})
			);
		}, 10000);
		return () => clearInterval(id);
	});

	return (
		<div className="card_header">
			<div className="notification_logo">
				<img src={headerLogo} />
				<div>{headerText}</div>
			</div>
			<br />
			<div className="issued_at">Issued: {issuedTime} ago</div>
			<div className="received_at">Received: {receivedTime} ago</div>
		</div>
	);
};

const ContentArea = (props: NotificationContentProps) => {
	const { title, type, contentLogo, details, timeout, source, meta, isRead, isSnoozed } = props;

	return (
		<div className="details">
			<h4 className="title">{title}</h4>
			<div className="notification_content">
				<img src={contentLogo} />
				<div>{details}</div>
			</div>
			<div className="meta-details">
				{(type || source || timeout || Object.keys(meta).length > 0 || isRead || isSnoozed) && (
					<>
						<h5 className="meta-info">Info</h5>
						<ul>
							{type && (
								<li>
									<div className="type">
										Notification Type:&nbsp;&nbsp;<span>{type}</span>
									</div>
								</li>
							)}
							{source && (
								<li>
									<div className="source">
										Notification Source:&nbsp;&nbsp;<span>{source}</span>
									</div>
								</li>
							)}
							{timeout && (
								<li>
									<div className="timeout">
										Notification Timeout:&nbsp;&nbsp;<span>{timeout} ms</span>
									</div>
								</li>
							)}
							{Object.keys(meta).length > 0 && (
								<>
									{Object.keys(meta).map((metaKey, i) => {
										return (
											<li key={i}>
												<span>
													{metaKey} : {meta[metaKey]}
												</span>
											</li>
										);
									})}
								</>
							)}
							{(isRead || isSnoozed) && (
								<li>
									<div className="flags">
										{isRead && (
											<div>
												Viewed: <span>✓</span>
											</div>
										)}
										{isSnoozed && (
											<div>
												Snoozed: <span>✓</span>
											</div>
										)}
									</div>
								</li>
							)}
						</ul>
					</>
				)}
			</div>
		</div>
	);
};

const ActionsArea = (props: NotificationActionsProps) => {
	const { actions, doAction } = props;

	return (
		<div className="details_footer">
			<hr />
			<div className="actions">
				{actions.map((action: IAction, i: number) => {
					const isDisabled = action.type === ActionTypes.DISMISS || action.type === ActionTypes.SNOOZE;
					const className = isDisabled ? "disabled" : null;

					return (
						<button
							className={className}
							key={i}
							onClick={() => doAction(props.notification, action)}
							disabled={isDisabled}
						>
							{action.buttonText}
						</button>
					);
				})}
			</div>
		</div>
	);
};

const HistoryArea = (props: NotificationHistoryProps) => {
	const { actionsHistory } = props;

	return (
		<div className="history">
			<hr />
			<div className="history_header">History:</div>
			<ul>
				{actionsHistory.map((history, i) => {
					if (history.type) {
						return (
							<li key={i}>
								{history.datePerformed} : {history.type}
							</li>
						);
					} else {
						return null;
					}
				})}
			</ul>
		</div>
	);
};

const NotificationsPanel = (props: NotificationPanelProps) => {
	const { notification, doAction } = props;
	const { actions } = notification;
	const { id } = notification;

	return (
		<section id="notification-center__notification-detail">
			<h3>
				Notification Detail:{" "}
				<img src="../shared/assets/close.svg" id="close-icon" onClick={() => props.clearActiveNotification(null)} />
			</h3>
			<div className="notification_card" title={id}>
				<HeaderArea {...notification} />
				<ContentArea {...notification} />
				{notification.actions.length > 0 && (
					<ActionsArea notification={notification} doAction={doAction} actions={actions} />
				)}
				<HistoryArea {...notification} />
			</div>
		</section>
	);
};

export default NotificationsPanel;
