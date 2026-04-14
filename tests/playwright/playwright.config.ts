import { defineConfig } from "@playwright/test";

export default defineConfig({
	workers: 1, // runs specs sequentially, each spec uses its own io.CD session.
	testDir: "./tests",
	timeout: 120000, // 2 minutes per test
});
