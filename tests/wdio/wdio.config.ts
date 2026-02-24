import { IOCDBaseConfiguration, IOCDService } from "@interopio/wdio-iocd-service";

export const config: WebdriverIO.Config = {
	...IOCDBaseConfiguration,

	// Services
	services: IOCDService(),

	// Capabilities
	capabilities: [
		{
			browserName: "iocd",
			"wdio:specs": ["./tests/**/*.spec.ts"],
			"iocd:options": {
				binary: "%BINARY_PATH%",
			},
		},
	],

	// WDIO Options
	logLevel: "info",
	framework: "mocha",
	mochaOpts: { timeout: 60000, retries: 0 },
	reporters: ["spec"],

	// TypeScript Autocompile
	autoCompileOpts: {
		autoCompile: true,
		tsNodeOpts: {
			transpileOnly: true,
			project: "./tsconfig.json",
		},
	},
};
