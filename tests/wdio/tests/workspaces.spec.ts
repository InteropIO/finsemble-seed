import { randomBytes } from "crypto";
import { SingleInputDialog, Toolbar, ToolbarWorkspaceMenu, YesNoDialog } from "../../apps";
import { IOCDSession, UITestSteps } from "./common";

describe("Smoke tests on workspaces", () => {
	let session: IOCDSession;
	let steps: UITestSteps;

	before(async () => {
		session = new IOCDSession(await browser.io());
		steps = new UITestSteps(session);
	});

	it("should create a new workspace", async () => {
		const newWorkspaceName = await createWorkspace();
		await openWorkspaceMenu();
		expect(await $(ToolbarWorkspaceMenu.selectors.workspace(newWorkspaceName)).isExisting()).toBe(true);

		await $(ToolbarWorkspaceMenu.selectors.workspace("Default Workspace")).waitAndClick();
	});

	// wd.io exits without clear reason after calling switchById multiple times.
	// TODO e2e investigate further and see if we can make a simpler reproducer
	it.skip("should confirm unsaved changes when closing workspace", async () => {
		await createWorkspace();
		await steps.openUserAppFromMenu();
		await openWorkspaceMenu();
		await $(ToolbarWorkspaceMenu.selectors.workspace("Default Workspace")).waitAndClick();

		const confirmSaveDialog = await session.findWindowByName(YesNoDialog.name, 2000);
		await browser.switchById(confirmSaveDialog.id);
		await $(YesNoDialog.selectors.confirmButton()).waitAndClick();
	});

	async function openWorkspaceMenu(): Promise<void> {
		const workspaceMenu = await session.findWindowByName(ToolbarWorkspaceMenu.name, 2000);

		if (!session.isVisible(workspaceMenu.id)) {
			const toolbar = await session.findWindowByName(Toolbar.name);
			await browser.switchById(toolbar.id);
			await $(Toolbar.selectors.workspaceMenuButton()).waitAndClick();
		}
		await browser.switchById(workspaceMenu.id);
	}

	async function createWorkspace(): Promise<string> {
		await openWorkspaceMenu();
		await $(ToolbarWorkspaceMenu.selectors.newButton()).waitAndClick();

		const confirmSaveDialog = await session.findWindowByName(YesNoDialog.name, 2000);
		if (confirmSaveDialog) {
			await browser.switchById(confirmSaveDialog.id);
			await $(YesNoDialog.selectors.confirmButton()).waitAndClick();
		}

		const newWorkspaceName = `test-${randomBytes(4).toString("hex")}`;
		const newWorkspaceDialog = await session.findWindowByName(SingleInputDialog.name, 2000);
		await browser.switchById(newWorkspaceDialog.id);
		await $(SingleInputDialog.selectors.input()).setValue(newWorkspaceName);
		await $(SingleInputDialog.selectors.confirmButton()).waitAndClick();
		return newWorkspaceName;
	}
});
