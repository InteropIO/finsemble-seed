import { defineConfig } from "@playwright/test";
import path from "path";
import fs from "fs";

if (!process.env.BINARY_PATH) {
	const projectRoot = path.resolve(__dirname, "../..");
	const cliConfig = JSON.parse(fs.readFileSync(path.join(projectRoot, "config", "iocd.cli.config.json"), "utf-8"));
	const productSlug: string = cliConfig.productSlug ?? "io-connect-desktop";
	const exeName: string = cliConfig.win?.exe?.exeName ?? `${productSlug}.exe`;
	process.env.BINARY_PATH = path.join(projectRoot, "components", "iocd", exeName);
}

export default defineConfig({
	workers: 1, // runs specs sequentially, each spec uses its own io.CD session.
	testDir: "./tests",
	timeout: 120000, // 2 minutes per test
});
