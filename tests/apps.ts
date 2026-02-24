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
		closeButton: () => "button.io-btn-icon .icon-close",
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
