import { SpawnParams } from "../FSBL-definitions/services/window/Launcher/launcher";

// type SpawnParamsWithoutData = Omit<SpawnParams, "data">;

export interface NotificationsConfig {
	filter?: {
		include?: [];
		exclude?: [];
	};
	position?: {};
	animation?: {
		displayDuration: number;
		animateIn: string;
		animateOut: string;
	};
	notificationsHistory?: boolean;
}

export default interface WindowConfig {
	window: SpawnParams & NotificationsConfig;
}
