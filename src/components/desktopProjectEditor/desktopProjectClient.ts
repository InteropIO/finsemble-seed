import { DPServerInfo } from "common/system";

type AppDConfig = any;
type URL = string;
type InstallerDescription = {
	name: string;
	version?: string;
	authors?: string;
	description?: string;
};
type CSS = { [key: string]: string };

const MAKER_TOPIC = "DesktopProjectClient";
const UI_CHANGE_TOPIC = "Finsemble-ui-change";

const { RouterClient } = FSBL.Clients;

enum AssetType {
	JS,
	CSS,
	JSON,
	Text,
	Image,
}

type Asset = {
	type: AssetType;
	file: File;
	targetPath: string;
};

type AssetMeta = {
	key: string;
	name: string;
	type: string;
	size: number;
	targetPath: string | undefined;
};

export type CosaicCloudInfo = {
	installerURL: string;
	manifestURL: string;
};

export type DeployInfo = CosaicCloudInfo & { uuid?: string };

export type ProjectConfig = {
	name: string;
	deployInfo?: DeployInfo;
};

export enum ProgressState {
	NotStarted = "NotStarted",
	Started = "Started",
	Error = "Error",
	Finished = "Finished",
}

export type ProgressItem = {
	step: string;
	state: ProgressState;
	percentComplete: number;
	error: string;
};

export type Progress = {
	steps: { [key: string]: ProgressItem };
	currentStep: string;
};

/**
 *
 * @class DesktopProjectClient
 *
 * @example
 *
 * Test Driver Example (can paste into component console)
 *
 window.desktopProjectClientDriver = async function makerClientDriver() {
	{
		let { err, apps } = await DesktopProjectClient.getApps();
		FSBL.Clients.Logger.log("getApps", err ? err : "ok" , apps);
	}
	{
		let { err, config } = await DesktopProjectClient.getAppConfig("Rates");
		FSBL.Clients.Logger.log("getAppConfig", err ? err : "ok" , config);
	}
	{
		let { config } = await DesktopProjectClient.getAppConfigTemplate();
		let { err } = await DesktopProjectClient.addApp("testApp1", config);
		FSBL.Clients.Logger.log("addApp", err ? err : "ok" );
	}
	{
		let { config } = await DesktopProjectClient.getAppConfigTemplate();
		let { err } = await DesktopProjectClient.updateApp("testApp1", config);
		FSBL.Clients.Logger.log("updateApp", err ? err : "ok" );
	}
	{
		let { err } = await DesktopProjectClient.deleteApp("testApp1");
		FSBL.Clients.Logger.log("deleteApp", err ? err : "ok" );
	}
	{
		FSBL.Clients.Logger.log("updateTheme", err ? err : "ok" );
		let { err } = await DesktopProjectClient.updateInstallerDescription({ name: "sample installer name", version: "V0.0.0", authors: "M. Smith", description: "sample installer descriptions" });
		FSBL.Clients.Logger.log("updateInstallerDescription", err ? err : "ok" );
	}
	{
		let blob = await fetch("http://localhost:3375/assets/img/test.png").then(r => r.blob());
		var file = new File([blob], "foo.png");
		let { err } = await DesktopProjectClient.updateToolbarIcon(file);
		console.log("updateToolbarIcon", err ? err : "ok" );
	}
	{
		let blob = await fetch("http://localhost:3375/assets/img/test.png").then(r => r.blob());
		var file = new File([blob], "foo.png");
		let { err } = await DesktopProjectClient.updateTaskbarIcon(file);
		console.log("updateTaskbarIcon", err ? err : "ok" );
	}
	{
		let blob = await fetch("http://localhost:3375/assets/img/test.png").then(r => r.blob());
		var file = new File([blob], "foo.png");
		let { err } = await DesktopProjectClient.updateSystemTrayIcon(file);
		console.log("updateSystemTrayIcon", err ? err : "ok" );
	}
	{
		let blob = await fetch("http://localhost:3375/assets/img/test.ico").then(r => r.blob());
		var file = new File([blob], "foo.ico");
		let { err } = await DesktopProjectClient.updateInstallerIcon(file);
		console.log("updateInstallerIcon", err ? err : "ok" );
	}
	{
		let blob = await fetch("http://localhost:3375/assets/img/install-spinner.gif").then(r => r.blob());
		var file = new File([blob], "foo.gif");
		let { err } = await DesktopProjectClient.updateInstallerGraphic(file);
		console.log("updateInstallerGraphic", err ? err : "ok" );
	}
	{
		let blob = await fetch("http://localhost:3375/assets/img/test.svg").then(r => r.blob());
		var file = new File([blob], "foo.svg");
		let { err } = await DesktopProjectClient.updateSplashScreen(file);
		console.log("updateSplashScreen", err ? err : "ok" );
	}
	{
		let { err } = await DesktopProjectClient.updateTheme({ cssSampleData: 1 });
		console.log("updateTheme", err ? err : "ok" );
	}
	{
	 	let { err } = await DesktopProjectClient.createProjectZip("testApp", "~/Downloads/");
		FSBL.Clients.Logger.log("createProjectZip", err ? err : "ok" );
	}
	{
		<input type="file" onChange={(e) => {
			const file = e.target.files?.[0];

			let { err } = await DesktopProjectClient.uploadAssets([
				{
					file,
					type: AssetType.Image,
					targetPath: 'image.png',
				}
			], (progress) => {
				// ...
			});

			FSBL.Clients.Logger.log("uploadAssets", err ? err : "ok" );
		}} />
	}
}
 */
export class DesktopProjectClient {
	constructor() {}

	public async getDPServerInfo(): Promise<DPServerInfo> {
		const result = await FSBL.System.getDPServerInfo();
		return result;
	}

	/**
	 * Confirm the Desktop Project Server is enabled.  This should be true before constructing and using a client.
	 *
	 * @static
	 * @returns {Promise<Boolean>}
	 * @memberof DesktopProjectClient
	 */
	static async isEnable(): Promise<Boolean> {
		let { enabled } = await FSBL.System.getDPServerInfo();
		return enabled;
	}

	/**
	 * Get the desktop project server base URL.
	 *
	 * @static
	 * @returns {Promise<Boolean>}
	 * @memberof DesktopProjectClient
	 */
	public async applicationRoot(): Promise<string | null> {
		let { applicationRoot } = await FSBL.System.getDPServerInfo();
		return applicationRoot ? applicationRoot : null;
	}

	/**
	 *
	 */
	public async projectConfig(): Promise<ProjectConfig | null> {
		let { projectConfig } = await FSBL.System.getDPServerInfo();
		return projectConfig ? projectConfig : null;
	}

	/**
	 * Get list of all AppD applications
	 *
	 * @private
	 * @returns {Promise<{ err:any, data:any}>}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * let { err, apps } = await DesktopProjectClient.getApps();
	 */
	public async getApps(): Promise<{ err: any; apps: any }> {
		FSBL.Clients.Logger.log("DesktopProjectClient.getApps");
		let { err, response } = await RouterClient.query(`${MAKER_TOPIC}.getApps`, {});
		FSBL.Clients.Logger.log("DesktopProjectClient.getApps result", err ? err : "successful", response);
		return { err, apps: response.data.applications };
	}

	/**
	 * Get config for the specified AppD app.
	 *
	 * @private
	 * @param {string} appName
	 * @returns {Promise<{ err:any, config:any}>}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * let { err, config } = await DesktopProjectClient.getAppConfig("testApp");
	 */
	public async getAppConfig(appName: string): Promise<{ err: any; config: any }> {
		FSBL.Clients.Logger.log("DesktopProjectClient.getAppConfig", appName);
		let { err, response } = await RouterClient.query(`${MAKER_TOPIC}.getAppConfig`, { appName });
		FSBL.Clients.Logger.log("DesktopProjectClient.getAppConfig result", err ? err : "successful", response);
		return { err, config: response.data };
	}

	/**
	 * Helper function returning a AppD config template with Finsemble component in manifest property.
	 *
	 * @private
	 * @returns {Promise<{ config: any }>}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * let { config } = await DesktopProjectClient.getAppConfigTemplate();
	 */
	public async getAppConfigTemplate(): Promise<{ config: any }> {
		FSBL.Clients.Logger.log("DesktopProjectClient.getAppConfigTemplate");
		let componentJson = {
			window: {
				// url: "$applicationRoot/components/welcome/welcome.html",
				url: "",
				resizable: true,
				frame: false,
				autoShow: true,
				top: "center",
				left: "center",
				width: 1280,
				height: 600,
			},
			component: {
				spawnOnStartup: false,
				preload: false,
			},
			foreign: {
				services: {
					dockingService: {
						canGroup: true,
					},
				},
				components: {
					"App Launcher": {
						launchableByUser: true,
					},
					"Window Manager": {
						persistWindowState: true,
						FSBLHeader: true,
						showLinker: true,
					},
				},
			},
		};

		let appConfigTemplate = {
			appId: "123",
			name: "",
			manifest: componentJson,
			manifestType: "vendor_type",
			version: "1",
			title: "app title",
			tooltip: "app tip",
			description: "",
			images: [
				{
					url: "string",
				},
			],
			contactEmail: "string",
			supportEmail: "string",
			publisher: "string",
			icons: [
				{
					icon: "string",
				},
			],
			customConfig: [
				{
					name: "string",
					value: "string",
				},
			],
			intents: [
				{
					name: "string",
					displayName: "string",
					contexts: ["string"],
					customConfig: {},
				},
			],
		};
		FSBL.Clients.Logger.log("DesktopProjectClient.getAppConfigTemplate result", appConfigTemplate);
		return { config: appConfigTemplate };
	}

	/**
	 * Add AppD application, which will modify Finsemble config and invoke REST API to persist the change
	 *
	 * @private
	 * @param {string} appName
	 * @param {AppDConfig} appConfig
	 * @returns {Promise<{ err }>}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * let { err } = await DesktopProjectClient.addApp("testApp", config);
	 */
	public async addApp(appName: string, appConfig: AppDConfig): Promise<{ err: any }> {
		FSBL.Clients.Logger.log("DesktopProjectClient.addApp", appName, appConfig);
		let { err } = await RouterClient.query(`${MAKER_TOPIC}.addApp`, { appName, appConfig });
		FSBL.Clients.Logger.log("DesktopProjectClient.addApp result", err ? err : "successful");
		return { err };
	}

	/**
	 * Update AppD application, which will modify current Finsemble config and invoke REST API to persist the change
	 *
	 * @private
	 * @param {string} appName
	 * @param {AppDConfig} appConfig
	 * @returns {Promise<{ err }>}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * let { err } = await DesktopProjectClient.updateApp("testApp", config);
	 */
	public async updateApp(appName: string, appConfig: AppDConfig): Promise<{ err: any }> {
		FSBL.Clients.Logger.log("DesktopProjectClient.updateApp", appName, appConfig);
		let { err } = await RouterClient.query(`${MAKER_TOPIC}.updateApp`, { appName, appConfig });
		FSBL.Clients.Logger.log("DesktopProjectClient.updateApp result", err ? err : "successful");
		return { err };
	}

	/**
	 * Remove AppD application, which will modify Finsemble config and invoke REST API to persist the change
	 *
	 * @private
	 * @param {string} appName
	 * @returns {Promise<{ err }>}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * let { err } = await DesktopProjectClient.deleteApp("testApp");
	 */
	public async deleteApp(appName: string): Promise<{ err: any }> {
		FSBL.Clients.Logger.log("DesktopProjectClient.deleteApp", appName);
		let { err } = await RouterClient.query(`${MAKER_TOPIC}.deleteApp`, { appName });
		FSBL.Clients.Logger.log("DesktopProjectClient.deleteApp result", err ? err : "successful");
		return { err };
	}

	/**
	 * Update the theme of all components and invoke REST API to persist the change in Finsemble's theme.css file
	 *
	 * @param {CSS} theme
	 * @returns {Promise<{ err }>}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * let { err } = await DesktopProjectClient.updateTheme(cssData);
	 */
	public async updateTheme(theme: CSS): Promise<{ err: any }> {
		FSBL.Clients.Logger.log("DesktopProjectClient.updateTheme", theme);
		let { err } = await RouterClient.query(`${MAKER_TOPIC}.updateTheme`, { theme });
		FSBL.Clients.Logger.log("DesktopProjectClient.updateTheme result", err ? err : "successful");
		return { err };
	}

	/**
	 * Add handler listening for theme updates
	 *
	 * @param {StandardCallback<StandardError, any>} themeUpdatedHandler:
	 * @returns {Function} When called, unsubscribes the handler
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * let { err } = await DesktopProjectClient.updateTheme(cssData);
	 */
	public static onThemeUpdated(themeUpdatedHandler: StandardCallback<StandardError, any>): Function {
		FSBL.Clients.RouterClient.addListener(`${UI_CHANGE_TOPIC}.themeUpdate`, themeUpdatedHandler);
		FSBL.Clients.Logger.log("DesktopProjectClient.onThemeUpdated", themeUpdatedHandler);
		return () => FSBL.Clients.RouterClient.removeListener(`${UI_CHANGE_TOPIC}.themeUpdate`, themeUpdatedHandler);
	}

	/**
	 * Post a file to the desktop project Server
	 *
	 * @param {Asset[]} assets
	 * @param {Function} progress
	 * @returns {Promise<{ err }>}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * ...
	 */
	public async uploadAssets(assets: Asset[], progress: Function): Promise<{ err: string | null; paths: string[] }> {
		FSBL.Clients.Logger.log("DesktopProjectClient.uploadAssets", assets);

		const applicationRoot = await this.applicationRoot();

		return new Promise((resolve) => {
			const endpointURL = `${applicationRoot}/project/assets`;

			const data = new FormData();

			const assetMeta: AssetMeta[] = [];

			for (let index = 0; index < assets.length; index++) {
				let asset = assets[index];

				const meta = {
					key: `file-${index}`,
					name: asset.file.name,
					type: asset.file.type,
					size: asset.file.size,
					targetPath: asset.targetPath,
				};

				let error = null;

				if (asset.type === AssetType.Image && !/\.(jpe?g|png|gif|ico|svg)$/i.test(asset.file.name)) {
					error = "File must be of type JPG, SVG, PNG, GIF, or ICO";
				}

				if (error) {
					FSBL.Clients.Logger.log("DesktopProjectClient.uploadAssets wrong image type", error);
					return resolve({ err: error, paths: [] });
				} else {
					FSBL.Clients.Logger.log("DesktopProjectClient.uploadAssets append", meta.key, asset.file);
					data.append(meta.key, asset.file);
					assetMeta.push(meta);
				}
			}

			data.append("assets", JSON.stringify(assetMeta));

			var xhr = new XMLHttpRequest();

			FSBL.Clients.Logger.log("DesktopProjectClient.uploadAssets put", data, endpointURL);
			xhr.open("PUT", endpointURL, true);

			xhr.addEventListener("progress", (e) => {
				progress(Math.round((e.loaded / e.total) * 100));
			});

			// xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

			xhr.onreadystatechange = () => {
				// Call a function when the state changes.
				if (xhr.readyState === XMLHttpRequest.DONE) {
					progress(100);

					if (xhr.status !== 200) {
						FSBL.Clients.Logger.log("DesktopProjectClient.uploadAssets Failed Response", xhr.response);
						resolve({ err: `Got response code: ${xhr.status}`, paths: [] });
					} else {
						try {
							const response = JSON.parse(xhr.response);

							FSBL.Clients.Logger.log("DesktopProjectClient.uploadAssets Response", xhr.response);

							resolve({ err: null, paths: response.paths });
						} catch (e) {
							resolve({ err: "Couldn't parse response", paths: [] });
						}
					}
				}
			};

			FSBL.Clients.Logger.log("DesktopProjectClient.uploadAssets send", data);
			xhr.send(data);
		});
	}

	/**
	 * Post images to the desktop project Server
	 *
	 * @param {File[]} files
	 * @param {Function} progress
	 * @returns {Promise<{ err }>}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * ...
	 */
	public async uploadImages(files: File[], progress: Function): Promise<{ err: any; paths: string[] }> {
		return this.uploadAssets(
			files.map(
				(file) =>
					({
						file,
						type: AssetType.Image,
					} as Asset)
			),
			progress
		);
	}

	/**
	 * Post an image to the desktop project server
	 *
	 * @param {File} file
	 * @param {Function} progress
	 * @returns {Promise<{ err }>}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * ...
	 */
	public async uploadImage(file: File, progress: Function): Promise<{ err: any; path: string }> {
		return new Promise((resolve, reject) => {
			this.uploadImages([file], progress)
				.then((response: { err: any; paths: string[] }) => {
					resolve({ err: response.err, path: response.paths[0] });
				})
				.catch(reject);
		});
	}

	/**
	 * Update installer description by using REST API to persist the change
	 *
	 * @param {object} InstallerDescription
	 *
	 * @example
	 * let { err } = await DesktopProjectClient.updateInstallerDescription(installerDescription);
	 */
	public async updateInstallerDescription(installerDescription: InstallerDescription): Promise<{ err: any }> {
		FSBL.Clients.Logger.log("DesktopProjectClient updateInstallerDescription", installerDescription);
		let { err } = await FSBL.RESTUtils.httpPatch(`/project/installer`, installerDescription);
		FSBL.Clients.Logger.log("DesktopProjectClient.updateInstallerDescription Response", err ? err : "successful");
		return { err };
	}

	/**
	 * Update installer description by using REST API to persist the change
	 *
	 * @param {object} InstallerDescription
	 *
	 * @example
	 * let { err } = await DesktopProjectClient.updateInstallerDescription(installerDescription);
	 */
	public async updateProjectSettings(settings: {
		name: string;
		version?: string;
		authors?: string;
		description?: string;
	}): Promise<{ err: any }> {
		console.log("DesktopProjectClient updateProjectSettings", settings);
		let { err } = await FSBL.RESTUtils.httpPatch(`/project/settings`, settings);
		return { err };
	}

	/**
	 * Helper function -- progress descriptor for updating files
	 *
	 * @private
	 * @param {*} progress
	 * @memberof DesktopProjectClient
	 */
	private progressIndicator(progress: any) {
		FSBL.Clients.Logger.log("DesktopProjectClient.progressIndicator Console-Only", progress);
		console.log("Console-Only Progress Indicator:", progress);
	}

	/**
	 * Update Finsemble toolbar icon file and transmit correspond ui-changed message so UI will pick up change
	 *
	 * @param {File} imageFile
	 * @returns {Promise<{ err: any }>}
	 * @memberof DesktopProjectClient
	 */
	public async updateToolbarIcon(imageFile: File): Promise<{ err: string | null; path: string }> {
		const TARGET_FILE = "assets/img/Finsemble_Toolbar_Icon.png";
		FSBL.Clients.Logger.log("DesktopProjectClient.updateToolbarIcon", TARGET_FILE, imageFile);

		let { err, paths } = await this.uploadAssets(
			[
				{
					file: imageFile,
					type: AssetType.Image,
					targetPath: TARGET_FILE,
				},
			],
			this.progressIndicator
		);

		if (!err) {
			// transmit change notification so Finsemble can dynamically update (see toolbar)
			RouterClient.transmit("Finsemble-ui-change.toolbarIconUpdate", {});
		}

		FSBL.Clients.Logger.log("DesktopProjectClient.updateToolbarIcon result", err ? err : "successful");
		return { err, path: paths[0] };
	}

	/**
	 * Update Finsemble taskbar icon file and transmit correspond ui-changed message so UI will pick up change
	 *
	 * @param {File} imageFile
	 * @returns {Promise<{ err: any }>}
	 * @memberof DesktopProjectClient
	 */
	public async updateTaskbarIcon(imageFile: File): Promise<{ err: string | null; path: string }> {
		const TARGET_FILE = "assets/img/Finsemble_Taskbar_Icon.png";
		FSBL.Clients.Logger.log("DesktopProjectClient.updateTaskbarIcon", imageFile);

		let { err, paths } = await this.uploadAssets(
			[
				{
					file: imageFile,
					type: AssetType.Image,
					targetPath: TARGET_FILE,
				},
			],
			this.progressIndicator
		);

		if (!err) {
			// transmit notification so Finsemble can dynamically update (e.g. toolbar, taskbar)
			RouterClient.transmit("Finsemble-ui-change.taskbarIconUpdate", {});
		}

		FSBL.Clients.Logger.log("DesktopProjectClient.updateTaskbarIcon result", err ? err : "successful");
		return { err, path: paths[0] };
	}

	/**
	 * Update system tray icon file and refresh config entry to trigger notification
	 *
	 * @param {File} imageFile
	 * @returns {Promise<{ err: any }>}
	 * @memberof DesktopProjectClient
	 */
	public async updateSystemTrayIcon(imageFile: File): Promise<{ err: string | null; path: string }> {
		const TARGET_FILE = "assets/img/Finsemble_SystemTray_Icon.png";
		FSBL.Clients.Logger.log("DesktopProjectClient.updateSystemTrayIcon", imageFile);

		let { err: error1, paths } = await this.uploadAssets(
			[
				{
					file: imageFile,
					type: AssetType.Image,
					targetPath: TARGET_FILE,
				},
			],
			this.progressIndicator
		);

		// since the icon URL is kept in config, refresh the config entry using the current value to trigger a notification
		let { err: error2 } = await RouterClient.query(`${MAKER_TOPIC}.refreshSystemTrayIconConfig`, {});

		FSBL.Clients.Logger.log(
			"DesktopProjectClient.updateSystemTrayIcon result",
			error1 || error2 ? { error1, error2 } : "successful"
		);
		return { err: error1 || error2, path: paths[0] };
	}

	/**
	 * Update the installer Icon file -- the change will not be picked up until the installer is built
	 *
	 * @param {File} iconFile
	 * @returns {Promise<{ err: any }>}
	 * @memberof DesktopProjectClient
	 */
	public async updateInstallerIcon(iconFile: File): Promise<{ err: string | null; path: string }> {
		const TARGET_FILE = "assets/img/installer_icon.ico";
		FSBL.Clients.Logger.log("DesktopProjectClient.updateInstallerIcon", iconFile);

		let { err, paths } = await this.uploadAssets(
			[
				{
					file: iconFile,
					type: AssetType.Image,
					targetPath: TARGET_FILE,
				},
			],
			this.progressIndicator
		);

		FSBL.Clients.Logger.log("DesktopProjectClient.updateSystemTrayIcon result", err ? err : "successful");
		return { err, path: paths[0] };
	}

	/**
	 * Update the installer graphic file -- the change will not be picked up until the installer is built
	 *
	 * @param {File} gifFile
	 * @returns {Promise<{ err: any }>}
	 * @memberof DesktopProjectClient
	 */
	public async updateInstallerGraphic(gifFile: File): Promise<{ err: string | null; path: string }> {
		const TARGET_FILE = "assets/img/installer_spinner.gif";
		FSBL.Clients.Logger.log("DesktopProjectClient.updateInstallerGraphic", gifFile);

		let { err, paths } = await this.uploadAssets(
			[
				{
					file: gifFile,
					type: AssetType.Image,
					targetPath: TARGET_FILE,
				},
			],
			this.progressIndicator
		);

		FSBL.Clients.Logger.log("DesktopProjectClient.updateInstallerGraphic result", err ? err : "successful");
		return { err, path: paths[0] };
	}

	/**
	 * Update the splash screen image file -- the change will not be picked up until Finsemble/FEA is restarted
	 *
	 * @param {File} svgFile
	 * @returns {Promise<{ err: any }>}
	 * @memberof DesktopProjectClient
	 */
	public async updateSplashScreen(svgFile: File): Promise<{ err: string | null; path: string }> {
		const TARGET_FILE = "assets/img/FinsembleSplash.png";
		FSBL.Clients.Logger.log("DesktopProjectClient.updateSplashScreen", svgFile);

		let { err, paths } = await this.uploadAssets(
			[
				{
					file: svgFile,
					type: AssetType.Image,
					targetPath: TARGET_FILE,
				},
			],
			this.progressIndicator
		);

		FSBL.Clients.Logger.log("DesktopProjectClient.updateSplashScreen result", err ? err : "successful");
		return { err, path: paths[0] };
	}

	/**
	 * Helper function to update a single theme variable within Finsemble's theme
	 *
	 * @static
	 * @param {string} varName
	 * @param {string} varValue
	 * @returns {Promise<{ err: any }>}
	 * @memberof DesktopProjectClient
	 */
	public static async updateThemeVariable(varName: string, varValue: string): Promise<{ err: any }> {
		const theme: CSS = {};
		theme[varName] = varValue;
		const client = new DesktopProjectClient();
		FSBL.Clients.Logger.log("DesktopProjectClient.updateThemeVariable", theme);
		return client.updateTheme(theme);
	}

	/**
	 * Save a .zip file of the project with `appName` to the local filesystem at `targetPath`
	 *
	 * @param {string} appName name of app to zip
	 * @param {string|undefined} targetPath output path for zip file
	 * @returns {Promise}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * let { err } = await DesktopProjectClient.createProjectZip("testApp", "~/Downloads/");
	 */
	public async createProjectZip(appName: string, targetPath: string | undefined = undefined): Promise<string> {
		const applicationRoot = await this.applicationRoot();
		FSBL.Clients.Logger.log("DesktopProjectClient.createProjectZip", applicationRoot);

		return new Promise((resolve, reject) => {
			const onTargetPath = (targetPath: any) => {
				const endpointURL = `${applicationRoot}/project/${appName}/zip?targetPath=${encodeURIComponent(targetPath)}`;

				FSBL.Clients.Logger.log(endpointURL);

				fetch(endpointURL)
					.then((response) => response.json())
					.then((data) => {
						resolve(data.file);
					})
					.catch(reject);
			};

			if (targetPath) {
				onTargetPath(targetPath);
			} else if (finsembleWindow) {
				finsembleWindow.showNativeOpenDialog(
					{
						title: "Select an output directory",
						buttonLabel: "Save .zip file",
						properties: ["openDirectory"],
					},
					(err: any, response: any) => {
						if (response?.[0]?.filePaths?.length > 0) {
							onTargetPath(response?.[0]?.filePaths[0]);
						}
					}
				);
			} else {
				reject("No finsembleWindow object");
			}
		});
	}

	/**
	 * checkValidProjectName
	 */
	public static checkValidProjectName(name: string) {
		return /^[a-zA-Z0-9 \-_.]{1,}$/.test(name);
	}

	/**
	 * Check an arbitrary string to see if it is a valid url
	 * The only checks for validity are:
	 * * if the string begins with "http://" or "https://"
	 *
	 * @param {string} url - the potential URL
	 * @return {boolean}
	 */
	public static checkValidURL(url: string) {
		if (url.length === 0) {
			return true;
		}
		return /^https?:\/\/[^\s]+$/.test(url);
	}

	/**
	 * Publish `.zip` file to the Cosaic Cloud
	 *
	 * @returns {Promise}
	 * @memberof DesktopProjectClient
	 *
	 * @example
	 * let { err } = await DesktopProjectClient.publishToCosaicCloud();
	 */
	public async publishToCosaicCloud(): Promise<DeployInfo> {
		const applicationRoot = await this.applicationRoot();
		FSBL.Clients.Logger.log("DesktopProjectClient.publishToCosaicCloud", applicationRoot);

		return new Promise(async (resolve, reject) => {
			const endpointURL = `${applicationRoot}/project/publish/cosaicCloud`;

			const response = await fetch(endpointURL, {
				method: "PUT",
			});

			// We get json data back whether it's a 200 or 500 response
			const data = await response.json();
			if (response.ok) {
				resolve(data);
			} else {
				reject(data);
			}
		});
	}

	/**
	 * Get the progress of a publish request
	 *
	 * @returns {Promise}
	 * @memberof DesktopProjectClient
	 *
	 */
	public async getPublishProgress(): Promise<Progress> {
		const applicationRoot = await this.applicationRoot();
		FSBL.Clients.Logger.log("DesktopProjectClient.getPublishProgress", applicationRoot);

		return new Promise((resolve, reject) => {
			const endpointURL = `${applicationRoot}/project/publish/progress`;

			fetch(endpointURL)
				.then((response) => response.json())
				.then((data) => {
					resolve(data);
				})
				.catch(reject);
		});
	}

	/**
	 * Resets the current project to factory defaults. Once complete, Finsemble is restarted
	 * so that the changes can take effect.
	 */
	public async resetProject(): Promise<[Error | null, any]> {
		const applicationRoot = await this.applicationRoot();
		FSBL.Clients.Logger.log("DesktopProjectClient.resetProject", applicationRoot);

		const endpointURL = `${applicationRoot}/project/reset`;

		const response = await fetch(endpointURL, {
			method: "PUT",
		});

		const data = await response.json();
		const error = response.ok ? null : new Error(data.message);
		response.ok && FSBL.restartApplication();
		return [error, data];
	}
}
