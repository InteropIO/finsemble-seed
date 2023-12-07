import path from "path";
import fsPromises from "fs/promises";
import { ChildProcess } from "child_process";

import { _electron as electron } from "playwright";
import { test as base, Page, ElectronApplication } from "@playwright/test";



// TODO: Change these values to suit requirements
//
// The root directory of Electron storage for Finsemble; should be changed on MacOS
const ELECTRON_STORAGE_ROOT_DIR = ("darwin" === process.platform) ? path.resolve(`${process.env.HOME}/Library/Application Support/Electron`) : path.resolve(`${process.env.HOME}/AppData/Roaming/Electron`);
// The directories in root storage to clean before each test
const ELECTRON_STORAGE_DIRS_TO_CLEAN = [path.resolve(`${ELECTRON_STORAGE_ROOT_DIR}/e2o`), path.resolve(`${ELECTRON_STORAGE_ROOT_DIR}/userdata`)];
//
// Logging severities
const ENABLE_DEBUG = true;
const ENABLE_VERBOSE = false;


// These values should not need to be changed
//
// Constants for launching Finsemble
const MANIFEST_URL = "http://localhost:3375/configs/application/manifest-local.json";
const DEBUG_PORT = "9090";
const INSPECT_PORT = "5858";
const APP_NAME = "Finsemble";
const APP_SCRIPT_PATH = path.resolve("./node_modules/@finsemble/finsemble-electron-adapter/dist/app.js");
const CLI_SCRIPT_PATH = path.resolve("./node_modules/@finsemble/finsemble-core/bin/cli.cjs");
const NODE_PATH = process.execPath;

// Ensure that the ELECTRON_DEV environment variable is set to "true" (required on MacOS to avoid SmartDesktop error messages)
process.env.ELECTRON_DEV = "true"

// Logging helpers
const formatMessage = (level, ...args: any[]) => {
    return [`[${level}]: `].concat(...args);
}
export const error = (...args: any[]) => {
    console.error.apply({}, formatMessage("ERROR    ", args));
}
export const warn = (...args: any[]) => {
    console.warn.apply({}, formatMessage("WARN    ", args));
}
export const debug = (...args: any[]) => {
    if (ENABLE_DEBUG) {
        console.log.apply({}, formatMessage("DEBUG   ", args));
    }
}
export const verbose = (...args: any[]) => {
    if (ENABLE_VERBOSE) {
        console.info.apply({}, formatMessage("VERBOSE ", args));
    }
}


/**
 * Waits for a condition to be true before proceeding. Optionally includes a retry limit and a max duration specifier. Note that
 * the maxDuration is approximate and can be up to maxDuration+pollIntervalMS-ish.
 *
 * @param checkFunction the function which is executed to check if the exit condition is true; the function can be async
 * @param pollIntervalMS the number of milliseconds to poll before executing the check function
 * @param maxRetries the maximum number of retries; any value less than 0 is interpreted as infinite
 * @param maxDurationMS the maximum number of milliseconds to wait for the check condition to be true; if 0, there is no timeout
 * @returns a Promise which resolves to true
 * @throws when the maxRetries is reached or maxDurationMS is exceeded
 */
export const waitFor = async (checkFunction: Function, pollIntervalMS: number = 250, maxRetries: number = -1, maxDurationMS: number = 0) => {
    verbose("waitFor", { pollInterval: pollIntervalMS, maxRetries, maxDurationMS });

    // The start time
    const startTimeMS = Date.now();

    while (0 !== maxRetries--) {
        // Honor "maxDuration" if present
        if (!!maxDurationMS) {
            const totalRuntimeMS = Date.now() - startTimeMS;
            if (totalRuntimeMS > maxDurationMS) {
                throw new Error(`waitFor timed out after ${totalRuntimeMS} milliseconds`);
            }
        }

        // Poll the check function
        if (true === await checkFunction()) {
            return true;
        } else {
            await sleepFor(pollIntervalMS);
        }
    }

    throw new Error(`waitFor reach max retries of ${maxRetries}`);
}

/**
 * Sleeps for a specified amount of time.
 *
 * @param sleepMS the number of milliseconds to sleep for
 */
export const sleepFor = async (sleepMS: number) => {
    verbose("sleepFor", { sleepMS });

    await new Promise((resolve) => {
        setTimeout(resolve, sleepMS);
    });
}

type ComponentCheckIsOpenFunction = (page: Page) => Promise<boolean>;


/**
 * This class encapsulates the Finsemble application and can be injected into test functions (test, beforeEach, afterEach, etc.).
 */
export class FinsembleApp {

    // URL's specific to Finsemble apps
    readonly PAGE_TOOLBAR_URL = "Toolbar/index.html";
    readonly PAGE_TOUR_URL = "Tour/tour.html";
    readonly PAGE_MENU_APPS_URL = "Toolbar/menu.html#AppLauncherMenu";


    // The Electron instance
    #electronApp: ElectronApplication;


    /**
     * Starts Finsemble.
     */
    async start() {
        verbose("FinsembleApp.start");

        // Launch Finsemble
        //
        // Launch options
        const launchOptions = {
            "headless": false,

            // To start Finsemble using CMD:
            // %PROJECT_DIR%\node_modules\electron\dist\electron.exe C:\Users\john-\dev\finsemble-seed\seed-master\node_modules\@finsemble\finsemble-electron-adapter\dist\app.js --remote-debugging-port=9090 --remote-allow-origins=* --inspect=5858 -name Finsemble undefined "C:\Program Files\nodejs\node.exe" C:\Users\john-\dev\finsemble-seed\seed-master\node_modules\@finsemble\finsemble-core\bin\cli.cjs start --manifest http://localhost:3375/configs/application/manifest-local.json
            //
            // To start Finsemble using bash:
            // ${PROJECT_DIR}/node_modules/electron/dist/electron /c/Users/john-/dev/finsemble-seed/seed-master/node_modules/@finsemble/finsemble-electron-adapter/dist/app.js --remote-debugging-port=9090 --remote-allow-origins=* --inspect=5858 -name Finsemble undefined "/c/Program Files/nodejs/node.exe" /c/Users/john-/dev/finsemble-seed/seed-master/node_modules/@finsemble/finsemble-core/bin/cli.cjs start --manifest http://localhost:3375/configs/application/manifest-local.json
            //

            // executablePath will defer to ./node_modules/.bin/electron
            // "executablePath": require("electron"),

            // Arguments for electron
            "args": [
                // App path
                APP_SCRIPT_PATH,

                // These values should not need to be adjusted for testing
                `--remote-debugging-port=${DEBUG_PORT}`,
                "--remote-allow-origins=*",
                `--inspect=${INSPECT_PORT}`,
                `-name ${APP_NAME}`,
                NODE_PATH,
                `${CLI_SCRIPT_PATH} start`,

                // This MUST be the last parameter
                `--manifest ${MANIFEST_URL}`
            ]
        }
        // Launch
        debug("Launching Finsemble with options", launchOptions);
        this.#electronApp = await electron.launch(launchOptions);


        // Listen to windows which are opening (useful for debugging and authoring tests)
        if (ENABLE_VERBOSE) {
            this.#electronApp.on("window", data => {
                verbose("startFinsemble", "Finsemble opened window", data.url());
            });
        }

        verbose("FinsembleApp.start", "Finsemble has been launched");
    };

    /**
     * Stops Finsemble. Reasonable attempts are made to stop Finsemble; however a SIGKILL can be sent after a
     * small amount of time, ensuring that Finsemble is stopped.
     */
    async stop() {
        verbose("FinsembleApp.stop");

        debug("FinsembleApp.stop", "Stopping Finsemble");

        // Get the process
        const appProcess: ChildProcess = this.#electronApp.process();

        verbose("FinsembleApp.stop", "Invoking API terminate");

        try {
            await this.execute("FSBL.System.terminate()");
            // await toolbar.evaluate("FSBL.System.terminate()");
            verbose("FinsembleApp.stop", "Terminating Finsemble via API was successful");
        } catch (e) {
            warn("FinsembleApp.stop", "Could not send the API command; Toolbar is disconnected (this is ok to ignore)");
        }


        // Terminate Electron fully, timing out after a set time
        await Promise.race([this.#electronApp.close(), sleepFor(5000)]);


        // See if Finsemble has exited
        if (null === appProcess.exitCode) {
            warn("FinsembleApp.stop", "Finsemble did not close cleanly, waiting for residual shutdown");
            // Wait for a few more seconds
            await Promise.race([await waitFor(() => null !== appProcess.exitCode), sleepFor(5000)]);
        }


        // Send a "control-c"
        if (null === appProcess.exitCode) {
            warn("FinsembleApp.stop", "Finsemble did not shut down, attempting graceful interrupt");
            if (!!appProcess.pid) {
                appProcess.kill("SIGINT");
            }
        }

        // Send a SIGKILL for stubborn processes
        if (null === appProcess.exitCode) {
            warn("FinsembleApp.stop", "Finsemble will not shut down gracefully, performing harsh termination");
            if (!!appProcess.pid) {
                appProcess.kill("SIGKILL");
            }
        }

        debug("FinsembleApp.stop", "Finsemble has been closed");
    };


    /**
     * Executes code in a component.
     *
     * @param code the code to execute
     * @param componentUrl the component to execute the code in
     */
    async execute(code: string, componentUrl: string = this.PAGE_TOOLBAR_URL) {
        // Default to the Toolbar, which is generally a reliable place to run code
        const page = await this.waitForPageByURL(componentUrl);

        // Execute the API call
        await page.evaluate(code);
    }


    /**
     * Gets a Page object based on a URL. Note that if multiple Pages are open to the same URL then
     * the returned object may be any of those.
     *
     * @param url the URL (or trailing fragment) to get the page of
     * @returns the Page matching the passed in url, or undefined if no Page is open to the specifed URL
     */
    async getPageByURL(url: string) {
        verbose("FinsembleApp.getPageByURL", { url });

        return (await this.#electronApp.windows()).filter((page: Page) => page.url().endsWith(url))[0];
    }

    /**
     * Waits for a Page (specified by URL) to be made available. Note that if multiple Pages are
     * open to the same URL then the returned object may be any of those.
     *
     * @param url the URL (or trailing fragment) to get the page of
     * @returns the Page matching the passed in url
     */
    async waitForPageByURL(url: string) {
        verbose("FinsembleApp.getPageByURL", { url });

        // The page
        let page: any;

        // Invoke a "waitFor" for a Page instance (by the URL)
        await waitFor(async () => !!(page = await this.getPageByURL(url)));

        verbose("FinsembleApp.getPageByURL", url, "success", !!page);

        // Cast to Page; this cast should be safe because the "waitFor" will not terminate
        // until a matching Page has been found; this infinite wait is bound by the test timeout
        return page as Page;
    }


    /**
     * Clears the Electron and Finsemble storage data from disk; this helps to ensure that a baseline
     * Finsemble instance can be replicated reliably when executed before starting Finsemble.
     */
    async clearElectronAndFinsembleData() {
        verbose("FinsembleApp.clearElectronAndFinsembleData", "cleaning Electron and Finsemble storage data", ELECTRON_STORAGE_DIRS_TO_CLEAN);

        try {
            // Clear all the configured directories (usually "e2o" and "userdata")
            await Promise.all(ELECTRON_STORAGE_DIRS_TO_CLEAN.map((dir) => fsPromises.rm(dir, { recursive: true })));
        } catch (e) {
            error("FinsembleApp.clearElectronAndFinsembleData", "Could not clear Electron and Finsemble storage data", e);
        }
    }


    /**
     * Checks that a component is opened. This requires the URL of a component and a checkFunction which will evaluate the
     * matching Page object for validation. Note that if multiple Pages are open to the same URL then the returned object
     * may be any of those.
     *
     * @param url the URL of the component to check
     * @param checkFunction the function to validate that the component is properly opened
     * @returns a Promise which resolves to "true" if the checkFunction determines that the component is proper; "false" otherwise
     */
    async validateComponentIsOpened(url: string, checkFunction: ComponentCheckIsOpenFunction) {
        verbose("FinsembleApp.validateComponentIsOpened", { url });
        const page: Page | undefined = await this.waitForPageByURL(url);

        if (page) {
            await waitFor(async () => await checkFunction(page));
            verbose("FinsembleApp.validateComponentIsOpened", "validated, the app is open");
            return true;
        }

        verbose("FinsembleApp.validateComponentIsOpened", "NOT validated, the app is NOT open");
        return false;
    }

}

// Used to encapsulate the types available for test function injection
type FinsembleTestContext = {
    finsemble: FinsembleApp;
}


// Extend the test so that FinsembleApp can be injected
export const test = base.extend<FinsembleTestContext>({
    finsemble: async ({ }, use) => {
        await use(new FinsembleApp());
        // await any cleanup code here
    }
});

export { Page, expect } from "@playwright/test";
