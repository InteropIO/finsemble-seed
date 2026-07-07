import { type IOConnectDesktop as IOCD } from "@interopio/desktop";
import { exec } from "child_process";
import path from "path";
import { ElectronApplication, Page, _electron as electron } from "playwright";
import { Toolbar } from "../../../apps";
import { expect } from "playwright/test";

export interface IOCDWindowHandle {
	window: IOCD.Windows.IOConnectWindow;
	page: Page;
}

// Groups are special kind of windows. For instance, each decorator window is practically a group.
export interface IOCDGroupHandle {
	window: IOCD.Windows.Group;
	page: Page;
}

export class IOCDSession {
	public toolbar: Page;

	private electronApp: ElectronApplication;

	private io: IOCD.API;

	// Name of the launched io.CD binary (e.g. "Finsemble.exe" on Windows, "Finsemble" on macOS);
	private binaryName: string;

	// Console errors and uncaught exceptions collected per page, from the time listeners are attached onward.
	private consoleErrors = new Map<Page, string[]>();

	private constructor(electronApp: ElectronApplication, toolbar: Page, io: IOCD.API, binaryName: string) {
		this.electronApp = electronApp;
		this.toolbar = toolbar;
		this.io = io;
		this.binaryName = binaryName;
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
		await this.waitForFinsembleUserStage(io);
		const session = new IOCDSession(electronApp, toolbar, io, path.basename(binaryPath));
		session.trackConsoleErrors();
		return session;
	}

	// Returns the console errors / uncaught exceptions recorded for a given page.
	getConsoleErrors(page: Page): string[] {
		return this.consoleErrors.get(page) ?? [];
	}

	private trackConsoleErrors(): void {
		const attach = (page: Page) => {
			page.on("console", (msg) => {
				if (msg.type() === "error") this.recordError(page, `[console.error] ${msg.text()}`);
			});
			page.on("pageerror", (err) => this.recordError(page, `[pageerror] ${err.message}`));
			page.once("close", () => this.consoleErrors.delete(page));
		};

		// Windows created from now on (e.g. user apps opened during a test).
		this.electronApp.on("window", attach);
		// Existing windows. E.g. decorator windows are pooled at boot, without this they would go untracked.
		this.electronApp.windows().forEach(attach);
	}

	private recordError(page: Page, message: string): void {
		const errors = this.consoleErrors.get(page) ?? [];
		errors.push(message);
		this.consoleErrors.set(page, errors);
	}

	async waitForNewInstance(appName: string, timeout = 5000): Promise<IOCDWindowHandle | undefined> {
		const timer = setTimeout(() => {
			throw new Error(`Timeout waiting for new instance of app '${appName}'`);
		}, timeout);

		await IOCDSession.waitForPageToLoad(appName, this.electronApp);
		clearTimeout(timer);
		return await this.findWindowHandleByName(appName);
	}

	async waitForWindowClose(id: string, timeout = 5000): Promise<void> {
		const deadline = Date.now() + timeout;

		while (this.io.windows.findById(id)) {
			if (Date.now() >= deadline) {
				throw new Error(`Timeout waiting for window '${id}' to close after ${timeout}ms`);
			}
			await new Promise((r) => setTimeout(r, 500));
		}
	}

	async findWindowHandle(id: string): Promise<IOCDWindowHandle | undefined> {
		const window = this.io.windows.findById(id);

		if (window) {
			const page = await this.findPage(window.id);
			expect(page, `no page found for window (id=${id})`).toBeDefined();
			return { window, page };
		}
		return undefined;
	}

	async findWindowHandleByName(name: string): Promise<IOCDWindowHandle | undefined> {
		const window = this.io.windows.find(name);

		if (window) {
			const page = await this.findPage(window.id);
			expect(page, `no page found for window (name=${name},id=${window.id})`).toBeDefined();
			return { window, page };
		}
		return undefined;
	}

	async findGroupByWindow(windowId: string): Promise<IOCDGroupHandle | undefined> {
		const group = this.io.windows.groups.findGroupByWindow(windowId);

		if (group) {
			const page = await this.findPage(group.id);
			expect(page, `no page found for group window (id=${windowId})`).toBeDefined();
			return { window: group, page };
		}
		return undefined;
	}

	async isVisible(id: string): Promise<boolean> {
		return this.io.windows.findById(id)?.isVisible ?? false;
	}

	async shutdown(): Promise<void> {
		try {
			await this.io?.platform.shutdown({ autoSave: false, showDialog: false });
			this.io?.connection.logout();
		} catch (error) {
			console.warn("Error during io.CD platform shutdown:", error);
		}
		this.io = null;

		// Closes the Playwright-launched Electron app so its process tree starts terminating.
		try {
			await this.electronApp.close();
		} catch (error) {
			console.warn("Error closing Electron application:", error);
		}

		// Ensures the io.CD process is fully gone before the next session launches.
		if (this.binaryName) await IOCDSession.waitForProcessExit(this.binaryName);
	}

	private static waitForPageToLoad(appName: string, electronApp: ElectronApplication): Promise<Page> {
		console.log(`Waiting for ${appName} page to appear...`);

		return new Promise((resolve) => {
			const handler = async (page: Page) => {
				try {
					const iodesktop: any = await page.evaluate("window.iodesktop");

					if (iodesktop && iodesktop.applicationName === appName && !page.isClosed()) {
						console.log(`${appName} page is found, waiting for it to load...`);
						electronApp.off("window", handler);
						// waitForLoadState resolves immediately if the page is already loaded.
						await page.waitForLoadState("load").catch(() => {});
						console.log(`${appName} page is loaded.`);
						resolve(page);
					}
				} catch (err) {
					// The handler fires for every window; probing one that is mid-navigation or closing can throw.
					console.warn(`Error while evaluating page: ${err instanceof Error ? err.message : err}`);
				}
			};
			electronApp.on("window", handler);
		});
	}

	private static async waitForProcessExit(processName: string, timeout = 30000): Promise<void> {
		const deadline = Date.now() + timeout;

		while (await this.isProcessRunning(processName)) {
			if (Date.now() >= deadline) {
				console.warn(`'${processName}' still running after ${timeout}ms; force killing.`);
				await this.killProcess(processName);
				return;
			}
			await new Promise((r) => setTimeout(r, 1000));
		}
	}

	private static isProcessRunning(processName: string): Promise<boolean> {
		return new Promise((resolve) => {
			// Windows matches by image name (with the ".exe");
			// MacOS/Linux match the full command line via `pgrep -f`;
			const command =
				process.platform === "win32" ? `tasklist /FI "IMAGENAME eq ${processName}" /NH` : `pgrep -f "${processName}"`;
			exec(command, (error, stdout) => {
				if (process.platform === "win32") {
					resolve(stdout.toLowerCase().includes(processName.toLowerCase()));
				} else {
					resolve(!error && stdout.trim().length > 0);
				}
			});
		});
	}

	private static killProcess(processName: string): Promise<void> {
		return new Promise((resolve) => {
			const command =
				process.platform === "win32" ? `taskkill /F /IM "${processName}" /T` : `pkill -f "${processName}"`;
			exec(command, () => resolve()); // Best effort; ignore errors (e.g. process already gone).
		});
	}

	private static waitForFinsembleUserStage(io: IOCD.API): Promise<void> {
		return new Promise(async (resolve) => {
			const unsubscribe = await io.contexts.subscribe("finsemble-pubsub-topic-systemManager.boot.stage", (ctx) => {
				console.log("finsemble-pubsub-topic-systemManager.boot.stage ", ctx?.envelope?.stage);

				if (ctx?.envelope?.stage === "user") {
					unsubscribe();
					resolve();
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
		const io = await IODesktop({ auth: { gatewayToken: gwToken }, channels: true });
		console.log("Initialized IODesktop instance.");
		return io;
	}

	private async findPage(windowId: string, timeout = 5000): Promise<Page | undefined> {
		// A window can be registered in io.windows before its Playwright page is available.
		// Retry until the page resolves or the timeout elapses, The fast path returns with no delay.
		const deadline = Date.now() + timeout;

		do {
			for (const page of this.electronApp.windows()) {
				try {
					const iodesktop: any = await page.evaluate("window.iodesktop");
					if (iodesktop && iodesktop.windowId === windowId) return page;
				} catch {} // Possible error: "page.evaluate: Target page, context or browser has been closed"
			}
			await new Promise((r) => setTimeout(r, 500));
		} while (Date.now() < deadline);
		console.log(`Cannot find page for windowId ${windowId} after ${timeout}ms.`);
		return undefined;
	}
}
