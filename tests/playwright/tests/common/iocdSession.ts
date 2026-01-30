import { type IOConnectDesktop as IOCD } from "@interopio/desktop";
import path from "path";
import { ElectronApplication, Page, _electron as electron } from "playwright";
import { Toolbar } from "../../../apps";

export interface IOCDWindowHandle {
	window: IOCD.Windows.IOConnectWindow;
	page?: Page;
}

export class IOCDSession {
	public toolbar: Page;

	private electronApp: ElectronApplication;

	private io: IOCD.API;

	private constructor(electronApp: ElectronApplication, toolbar: Page, io: IOCD.API) {
		this.electronApp = electronApp;
		this.toolbar = toolbar;
		this.io = io;
	}

	static async startSession(): Promise<IOCDSession> {
		const binaryPath = process.env.BINARY_PATH; // follows the convention of `iocd test`
		console.log("Starting io.CD session with binary:", binaryPath);

		const electronApp = await electron.launch({
			executablePath: binaryPath,
			cwd: path.resolve(path.dirname(binaryPath)),
		});
		const toolbar = await this.waitForPageToLoad(Toolbar.name, electronApp);
		const io = await this.initIODesktop(toolbar);
		await this.waitForPlatform(io);
		return new IOCDSession(electronApp, toolbar, io);
	}

	async waitForNewInstance(appName: string, timeout = 5000): Promise<IOCDWindowHandle | undefined> {
		const timer = setTimeout(() => {
			throw new Error(`Timeout waiting for new instance of app '${appName}'`);
		}, timeout);

		await IOCDSession.waitForPageToLoad(appName, this.electronApp);
		clearTimeout(timer);
		return await this.findWindowHandleByName(appName);
	}

	async findWindowHandle(id: string): Promise<IOCDWindowHandle | undefined> {
		const window = this.io.windows.findById(id);
		return window ? { window, page: await this.findPage(window.id) } : undefined;
	}

	async findWindowHandleByName(name: string): Promise<IOCDWindowHandle | undefined> {
		const window = this.io.windows.find(name);
		return window ? { window, page: await this.findPage(window.id) } : undefined;
	}

	async isVisible(id: string): Promise<boolean> {
		return this.io.windows.findById(id)?.isVisible ?? false;
	}

	async shutdown(): Promise<void> {
		await this.io.platform.shutdown({ autoSave: false, showDialog: false });
		this.io.connection.logout();
		this.io = null;
		// TODO e2e add finer work to wait until io.CD is terminated, or the next test can have trouble starting a new session.
		await new Promise((r) => setTimeout(r, 5000));
	}

	private static waitForPageToLoad(appName: string, electronApp: ElectronApplication): Promise<Page> {
		console.log(`Waiting for ${appName} to be loaded...`);

		return new Promise((resolve, reject) => {
			const handler = async (page) => {
				try {
					const iodesktop: any = await page.evaluate("window.iodesktop");

					if (iodesktop && iodesktop.applicationName === appName) {
						page.on("load", () => {
							console.log(`${appName} is loaded.`);
							electronApp.off("window", handler);
							resolve(page);
						});
					}
				} catch (error) {
					console.error(`Error while waiting for ${appName}:`, error);
					reject(error);
				}
			};
			electronApp.on("window", handler);
		});
	}

	private static waitForPlatform(io: IOCD.API): Promise<void> {
		return new Promise(async (resolve) => {
			// A more accurate way is to have fsbl-service respond its readiness on demand, to be reviewed if it can be added.
			const timer = setTimeout(() => {
				console.warn("io.CD has not signaled 'platform-started' in 20s after toolbar loaded, continue anyway.");
				resolve();
			}, 20000);
			await io.interop.register("T42.Platform.Events", ({ eventType }) => {
				if (eventType === "platform-started") {
					console.log("io.CD signaled 'platform-started'.");
					io.interop.unregister("T42.Platform.Events");
					clearTimeout(timer);
					setTimeout(() => resolve(), 5000); // wait for extra 5s to ensure polyfill is ready.
				}
			});
		});
	}

	private static async initIODesktop(existingPage: Page): Promise<IOCD.API> {
		console.log("Initializing IODesktop instance...");
		// Clear cache to avoid io.windows API returning stale data across desktop sessions.
		delete require.cache[require.resolve("@interopio/desktop")];
		const IODesktop = require("@interopio/desktop").default;

		const gwToken: string = await existingPage.evaluate("iodesktop.getGWToken()");
		const io = await IODesktop({ auth: { gatewayToken: gwToken } });
		console.log("Initialized IODesktop instance.");
		return io;
	}

	private async findPage(windowId: string): Promise<Page | undefined> {
		for (const page of this.electronApp.windows()) {
			const iodesktop: any = await page.evaluate("window.iodesktop");
			if (iodesktop && iodesktop.windowId === windowId) return page;
		}
		return undefined;
	}
}
