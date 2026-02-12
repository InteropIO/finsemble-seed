import { expect } from "@playwright/test";
import { Toolbar, ToolbarAppMenu, ToolbarWorkspaceMenu, UserApp } from "../../../apps";
import { IOCDSession, IOCDWindowHandle } from "./iocdSession";

export class UITestSteps {
	private session: IOCDSession;

	constructor(session: IOCDSession) {
		this.session = session;
	}

	async openUserAppFromMenu(): Promise<IOCDWindowHandle> {
		let appMenu = await this.session.findWindowHandleByName(ToolbarAppMenu.name);
		expect(appMenu?.window).toBeDefined(); // Visible or not, menu windows are normally loaded in advance.

		if (!appMenu.window.isVisible) {
			await this.session.toolbar.locator(Toolbar.selectors.appMenuButton()).click();
		}
		await appMenu.page.locator(ToolbarAppMenu.selectors.userApp()).click();
		const userApp = await this.session.waitForNewInstance(UserApp.name);
		expect(userApp.window).toBeDefined();
		expect(userApp.page).toBeDefined();
		await expect.poll(async () => await this.session.isVisible(userApp.window.id)).toBe(true);
		return userApp;
	}

	async openWorkspaceMenu(): Promise<IOCDWindowHandle> {
		const workspaceMenu = await this.session.findWindowHandleByName(ToolbarWorkspaceMenu.name);
		expect(workspaceMenu?.window).toBeDefined(); // Visible or not, menu windows are normally loaded in advance.

		if (!workspaceMenu.window.isVisible) {
			await this.session.toolbar.locator(Toolbar.selectors.workspaceMenuButton()).click();
		}
		return workspaceMenu;
	}
}
