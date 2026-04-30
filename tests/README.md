# Finsemble Seed Tests for io.Connect Desktop 🧪

This directory shows how to add UI tests for Finsemble polyfill (requires io.CD v10+):
- **playwright/** contains the setup to run [Playwright](https://playwright.dev/) tests.
- **wdio/** contains the setup to run [Webdriver.io](https://webdriver.io/) tests.

## How to run tests

### To run Playwright tests

In the root [package.json](../package.json) of finsemble-seed, change the script to:
```
"setup-iocd": "finsemble setup-iocd --tests-directory tests/playwright"
```
1. Run `yarn setup-iocd` and `yarn iocd` at least once to have io.CD available, refer to the main [README](../README.md#installing) for more details.
2. Run `yarn server` to serve your local assets.
3. Run `yarn test-iocd` to launch tests.

### To run Wdio tests
In the root [package.json](../package.json) of finsemble-seed, change the script to:
```
"setup-iocd": "finsemble setup-iocd --tests-directory tests/wdio"
```
1. Run `yarn setup-iocd` and `yarn iocd` at least once to have io.CD available, refer to the main [README](../README.md#installing) for more details.
2. Run `yarn server` to serve your local assets.
3. Run `yarn test-iocd` to launch tests.

## Write your own tests

### Write Playwright tests
Playwright testing requires handling the desktop lifecycle and cleanup on your own.  

In [playwright/tests/common/iocdSession.ts](playwright/tests/common/iocdSession.ts), you can find how lifecycle is managed for each spec file. If io.CD is not started properly during your tests, be sure to check these functions: `waitForPlatform`, `initIODesktop` and `shutdown`.  
In [playwright/tests/package.json](playwright/package.json), you can see how cleanup is done via the `pretest` hook, which helps ensure your tests are not affected by previous desktop sessions.  
> Cleanup runs before each test invocation, so starting a new test run will clear state left behind by earlier desktop sessions.

### Write Wdio tests
As [wdio/tests/](wdio/tests/) shows, adding tests is straightforward and similar to writing standard web app tests. 

For each spec file, wdio automatically handles the desktop lifecycle: you can assume io.CD is ready before running your tests, and io.CD is properly shutdown after running your tests.

In addition, io.CD provides extension methods such as `browser.io()` and `browser.switchById()`. This allows you to retrieve info from different app windows, or to operate them via platform API.


