import { test, expect, Page, FinsembleApp } from "./finsemble";


// TODO: Change these values to suit requirements
//
// The default test timeout
const TEST_TIMEOUT_MS = 30000;
//
// Electron and Finsemble data storage
const REMOVE_ELECTRON_STORAGE_BEFORE_EACH_TEST = true;


// Set the test timeout
test.setTimeout(TEST_TIMEOUT_MS);


test.beforeEach(async ({ finsemble }) => {
    // Clear the Electron/Finsemble storage if configured
    if (REMOVE_ELECTRON_STORAGE_BEFORE_EACH_TEST) {
        // Clear Electron/Finsemble storage dirs
        await finsemble.clearElectronAndFinsembleData();
    }

    // Start Finsemble
    await finsemble.start();

    // Wait for the authentication app (by URL)
    const authenticationPage = await finsemble.waitForPageByURL("Authentication/index.html");
    // Fill in the username and password
    await authenticationPage.locator("#username").fill("myUsername");
    await authenticationPage.locator("#password").fill("myp@ssw0rd");
    // Click the "Login" button
    await authenticationPage.locator('button:text("Login")').click();
});

test.afterEach(async ({ finsemble }) => {
    // Stop Finsemble
    await finsemble.stop();
});


// Test launching apps
test.describe("Launch the \"Tour\" app", () => {

    // A "helper" function to validate that the "Tour" component has opened
    const validateTourComponentIsOpened = async (finsemble: FinsembleApp) => {
        // Use finsemble.validateComponentIsOpened with the "Tour" url and a specific check which will pass only when the component is open
        return finsemble.validateComponentIsOpened(finsemble.PAGE_TOUR_URL, async (page) => !!page.getByText("Welcome to Your Smart Desktop"))
    }

    // Launch using mouse clicks
    test("Launch via the UI", async ({ finsemble }) => {
        // This is the text to look for in the apps menu
        const TOUR_APP_TEXT = "Take a Tour";

        // Get the Toolbar
        const toolbar = await finsemble.waitForPageByURL(finsemble.PAGE_TOOLBAR_URL);

        // Click on the "Apps" menu
        const appsMenu = toolbar.getByText("Apps");
        await appsMenu.click();

        // Get the apps menu
        const appMenuLauncher: Page = (await finsemble.waitForPageByURL(finsemble.PAGE_MENU_APPS_URL));

        // Click the "Tour" menu item
        await appMenuLauncher.getByText(TOUR_APP_TEXT).click();

        // Validate that the Tour component has opened
        expect(await validateTourComponentIsOpened(finsemble));

    });

    test("Launch via API", async ({ finsemble }) => {
        // Execute code to open the Tour
        await finsemble.execute("FSBL.Clients.AppsClient.spawn(\"Tour\")");

        // Validate that the Tour component has opened
        expect(await validateTourComponentIsOpened(finsemble));
    });

});
