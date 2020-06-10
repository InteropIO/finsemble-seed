export default function LauncherDefaults(): void;
export const UNKNOWN_DEFAULT_CONFIG: {
	window: {
		url: string;
		frame: boolean;
		resizable: boolean;
		autoShow: boolean;
		top: string;
		left: string;
		width: number;
		height: number;
		addToWorkspace: boolean;
	};
	component: {
		inject: boolean;
		spawnOnStartup: boolean;
	};
	foreign: {
		services: {
			dockingService: {
				canGroup: boolean;
				isArrangable: boolean;
			};
		};
		components: {
			"App Launcher": {
				launchableByUser: boolean;
			};
			"Window Manager": {
				showLinker: boolean;
				FSBLHeader: boolean;
				persistWindowState: boolean;
				title: string;
			};
			Toolbar: {
				iconClass: string;
			};
		};
	};
};
