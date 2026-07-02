interface TestApp {
	name: string; // unique application name
	selectors: { [key: string]: (...args: any[]) => string };
}

interface TestInterop {
	listensFor: {
		intent: string;
		context: any;
	};
}

export const Toolbar: TestApp = {
	name: "Toolbar",
	selectors: {
		appMenuButton: () => "#AppLauncherMenu-menu-toggle-button",
		workspaceMenuButton: () => "#WorkspaceMenu-menu-toggle-button",
		notificationsButton: () => ".finsemble-toolbar-button.icon-only[title^='Notification']",
		downloadsButton: () => ".finsemble-toolbar-button.icon-only[title^='Download Manager']",
	},
};

export const ToolbarAppMenu: TestApp = {
	name: "(Menu) AppLauncherMenu",
	selectors: {
		userApp: () => "//span[@class='app-name' and text()='Take a Tour']",
	},
};

export const ToolbarWorkspaceMenu: TestApp = {
	name: "(Menu) WorkspaceMenu",
	selectors: {
		newButton: () => "//div[@class='menu-item' and text()='New workspace']",
		saveButton: () => "//div[@class='menu-item' and text()='Save']",
		deleteButton: (name) =>
			`//span[@class='workspace-name' and text()='${name}']/following::i[contains(@class,'ff-adp-trash-outline')][1]`,
		workspace: (name) => `//span[@class='workspace-name' and text()='${name}']`,
	},
};

export const SingleInputDialog: TestApp = {
	name: "SingleInputDialog",
	selectors: {
		input: () => "#single-input",
		confirmButton: () => ".fsbl-button-affirmative",
	},
};

export const YesNoDialog: TestApp = {
	name: "YesNoDialog",
	selectors: {
		confirmButton: () => ".fsbl-button-affirmative",
	},
};

export const NotificationsPanel: TestApp = {
	name: "io-connect-notifications-panel-application",
	selectors: {
		container: () => ".io-notifications-panel",
		closeButton: () => ".io-panel-header button.io-btn-icon .icon-close",
	},
};

export const NotificationsApp: TestApp = {
	name: "io-connect-notifications-application",
	selectors: {
		title: () => ".io-notification-body-content h1",
		closeButton: () => ".io-notification-header button.io-btn-icon",
		actionButton: (text: string) => `.io-notification-footer button:has-text("${text}")`,
	},
};

export const DownloadManager: TestApp = {
	name: "io-connect-download-manager",
	selectors: {
		container: () => ".io-panel.io-dm",
		closeButton: () => "button.io-btn-icon .icon-close",
	},
};

export const IntentResolver: TestApp = {
	name: "intentsResolver",
	selectors: {
		instanceTarget: (appName: string) => `[data-testid="io-intent-resolver-instance-${appName}"]`,
		appTarget: (appName: string) => `[data-testid="io-intent-resolver-app-${appName}"]`,
		confirmButton: () => `[data-testid="io-intent-resolver-confirm-button"]`,
	},
};

export const ChannelSelector: TestApp = {
	name: "glue42-channel-selector",
	selectors: {
		channelItem: (name: string) =>
			`[data-testid="channel-selector-channel-${name}"] [data-testid="channel-selector-label"]`,
	},
};

export const UserApp: TestApp = {
	name: "Tour",
	selectors: { container: () => "#slides" },
};

export const InteropApp: TestApp & TestInterop = {
	name: "ChartIQ Example App",
	selectors: {},
	listensFor: {
		intent: "ViewChart",
		context: { type: "fdc3.instrument", id: { ticker: "AAPL" } },
	},
};
