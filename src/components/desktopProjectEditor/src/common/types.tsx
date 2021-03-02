export type ApplicationSaveData = {
	name: string;
	description: string;
	path: string;
	url: string;
	appType?: string;
	// tags: string[];
	width: number;
	height: number;
};

export type ProjectSaveData = {
	name: string;
	user: UserSaveData;
	export: ExportSaveData;
};

export type ExportSaveData = {
	author: string;
	companyName: string;
	description: string;
} & ProjectAssets;

export type ProjectAssets = {
	toolbarIcon: string;
	installerIcon: string;
	taskbarIcon: string;
	systemTrayIcon: string;
	splashScreenImage: string;
};

export type UserSaveData = {
	firstName: string;
	lastName: string;
	company: string;
	email: string;
};

export type DPServerInfo = {
	enabled: boolean;
	applicationRoot?: string;
};

export enum PublishState {
	Started = "Started",
	NotStarted = "NotStarted",
	Finished = "Finished",
	Error = "Error",
}

export type PublishProgress = {
	step: string;
	error: string;
	percentComplete: number;
	state: PublishState;
};
