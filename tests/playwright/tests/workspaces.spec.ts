import { test, expect } from "@playwright/test";
import { randomBytes } from "crypto";
import { SingleInputDialog, ToolbarWorkspaceMenu, YesNoDialog } from "../../apps";
import { IOCDSession, UITestSteps } from "./common";

let session: IOCDSession;
let steps: UITestSteps;

test.beforeAll(async () => {
	session = await IOCDSession.startSession();
	steps = new UITestSteps(session);
});

test.afterEach(async () => {
	// Allocate some spare time between tests.
	await new Promise((r) => setTimeout(r, 2500));
});

test.afterAll(async () => {
	await session?.shutdown();
});

test("should create a new workspace", async () => {
	const newWorkspaceName = await createWorkspace();
	const workspaceMenu = await steps.openWorkspaceMenu();
	const workspaceItem = await workspaceMenu.page.locator(ToolbarWorkspaceMenu.selectors.workspace(newWorkspaceName));
	await expect(workspaceItem).toBeVisible();

	await workspaceMenu.page.locator(ToolbarWorkspaceMenu.selectors.workspace("Default Workspace")).click();
});

test("should confirm unsaved changes when closing workspace", async () => {
	await createWorkspace();
	await steps.openUserAppFromMenu();
	const workspaceMenu = await steps.openWorkspaceMenu();
	const defaultWorkspaceItem = await workspaceMenu.page.locator(
		ToolbarWorkspaceMenu.selectors.workspace("Default Workspace")
	);
	await defaultWorkspaceItem.click();

	const confirmSaveDialog = await session.findWindowHandleByName(YesNoDialog.name);
	expect(confirmSaveDialog).toBeDefined();
	await confirmSaveDialog.page.locator(YesNoDialog.selectors.confirmButton()).click();
});

async function createWorkspace(): Promise<string> {
	const workspaceMenu = await steps.openWorkspaceMenu();
	await workspaceMenu.page.locator(ToolbarWorkspaceMenu.selectors.newButton()).click();

	const confirmSaveDialog = await session.findWindowHandleByName(YesNoDialog.name);
	if (confirmSaveDialog) {
		await confirmSaveDialog.page.locator(YesNoDialog.selectors.confirmButton()).click();
	}

	const newWorkspaceName = `test-${randomBytes(4).toString("hex")}`;
	const newWorkspaceDialog = await session.findWindowHandleByName(SingleInputDialog.name);
	await newWorkspaceDialog.page.locator(SingleInputDialog.selectors.input()).fill(newWorkspaceName);
	await newWorkspaceDialog.page.locator(SingleInputDialog.selectors.confirmButton()).click();
	return newWorkspaceName;
}
