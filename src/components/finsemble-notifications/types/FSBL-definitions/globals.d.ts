import { FinsembleWindow } from "./common/window/FinsembleWindow";
import { AuthenticationClient } from "./clients/authenticationClient";
import { ConfigClient } from "./clients/ConfigClient";
import { DialogManagerClient } from "./clients/dialogManagerClient";
import { DistributedStoreClient } from "./clients/DistributedStoreClient";
import { DragAndDropClient } from "./clients/DragAndDropClient";
import { HotkeyClient } from "./clients/hotkeysClient";
import { ICentralLogger } from "./clients/ICentralLogger";
import { IRouterClient } from "./clients/IRouterClient";
import { LauncherClient } from "./clients/LauncherClient";
import { LinkerClient } from "./clients/LinkerClient";
import { SearchClient } from "./clients/SearchClient";
import { StorageClient } from "./clients/StorageClient";
import { WindowClient } from "./clients/windowClient";
import { WorkspaceClient } from "./clients/WorkspaceClient";
import INotification from "../Notification-definitions/INotification";
declare global {
	interface Window {
		FSBL: FSBL;
		FinsembleWindow: FinsembleWindow;
	}
	const FSBL: FSBL;
}
export type FSBL = {
	Clients: Clients;
	ConfigUtils: any;
	onShutdown: any;
	shutdownComplete: any;
	addEventListener: Function
};
interface Clients {
	AuthenticationClient: AuthenticationClient;
	ConfigClient: ConfigClient;
	DistributedStoreClient: DistributedStoreClient;
	DialogManager: DialogManagerClient;
	DragAndDropClient: DragAndDropClient;
	HotkeyClient: HotkeyClient;
	LauncherClient: LauncherClient;
	LinkerClient: LinkerClient;
	Logger: ICentralLogger;
	NotificationClient: INotification;
	RouterClient: IRouterClient;
	SearchClient: SearchClient;
	StorageClient: StorageClient;
	WindowClient: WindowClient;
	WorkspaceClient: WorkspaceClient;
}
export declare var chrome: any;
export declare type WindowIdentifier = {
	windowName: string;
	componentType?: string;
	uuid?: string;
	windowType?: string;
};
export declare type WINDOWSTATE = {
	NORMAL: 0;
	MINIMIZED: 1;
	MAXIMIZED: 2;
	HIDDEN: 3;
};
export declare type ApplicationState = {
	state:
		| "undefined"
		| "initializing"
		| "authenticating"
		| "authenticated"
		| "configuring"
		| "ready"
		| "closing";
};
export declare type ApplicationStateChange = {
	data: ApplicationState;
};
export declare type ServiceState =
	| "initializing"
	| "ready"
	| "closing"
	| "closed";
export declare type ServiceStateChange = {
	data: ServiceState;
};
export declare type FinsembleDependencyObject = {
	services?: string[];
	clients?: string[];
};
export declare type ServiceConstructorParams = {
	startupDependencies: FinsembleDependencyObject;
	shutdownDependencies: FinsembleDependencyObject;
	addOFWrapper: boolean;
	name: string;
};
export declare type WrapState =
	| "created"
	| "initializing"
	| "ready"
	| "reloading"
	| "closing"
	| "closed";
export declare type WindowEventName =
	| "blurred"
	| "bounds-change-start"
	| "startedMoving"
	| "bounds-changing"
	| "bounds-change-request"
	| "bounds-change-end"
	| "stoppedMoving"
	| "broughtToFront"
	| "clicked"
	| "close-requested"
	| "closed"
	| "close-complete"
	| "created"
	| "focused"
	| "hide-requested"
	| "hidden"
	| "maximize-requested"
	| "maximized"
	| "minimize-requested"
	| "minimized"
	| "parent-set"
	| "parent-unset"
	| "ready"
	| "restore-requested"
	| "restored"
	| "show-requested"
	| "shown"
	| "title-changed"
	| "wrap-state-changed";
/**
 * Basic window event thrown by finsemble window. This type is for all non-bounds/wrap-state event changes.
 */
export declare interface WindowEvent {
	eventName: WindowEventName;
	name: string;
}
export declare type BoundsChangeType = 0 | 1 | 2;
/**
 * This type will be for any bounds-change event. Other window events use the WindowEvent type.
 * @interface BoundsChangeEvent
 */
export declare interface BoundsChangeEvent {
	eventName: WindowEventName;
	name: string;
	changeType: BoundsChangeType;
	top: number;
	left: number;
	width: number;
	height: number;
	right?: number;
	bottom?: number;
	uuid?: string;
	x?: number;
	y?: number;
	mousePosition?: {
		x: number;
		y: number;
	};
	timestamp?: number;
}
export declare type WindowBounds = {
	top: number;
	left: number;
	width: number;
	height: number;
	right?: number;
	bottom?: number;
};
export declare type Params = Record<string, any>;
export declare type PromiseResult = {
	err: any;
	data: any;
};
export declare type CallbackError = {
	message: string;
	code: string;
};
/**
 * The callback to be invoked if the method fails.
 */
export declare type StandardCallback<
	E = CallbackError | Error | string | null,
	R = any
> = (err: E, response?: R) => void;
export {};
