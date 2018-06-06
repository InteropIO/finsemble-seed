//Stats to parse from openfin. Comment out statistics if they interest you.
export const SIMPLE_MODE_STATISTICS = [
	{ label: "CPU", value: "cpuUsage" },
	{ label: "Memory", value: "workingSetSize" }
];
export const ADVANCED_MODE_STATISTICS = [
	{ label: "CPU", value: "cpuUsage" },
	{ label: "Memory", value: "workingSetSize" },
	{ label: "Peak Memory", value: "peakWorkingSetSize" }
	// "nonPagedPoolUsage",
	// "peakNonPagedPoolUsage",
	// "pagedPoolUsage",
	// "peakPagedPoolUsage",
	// "pagefileUsage",
	// "peakPagefileUsage",
	// "pageFaultCount"
];
/** Metrics get transformed. */
//UUID is left-aligned.
//CPU is in %
export const HIGH_CPU = 10;
export const MODERATE_CPU_USAGE = 5;

//Usage in MB
export const MODERATE_MEMORY_USAGE = 250;
export const HIGH_MEMORY_USAGE = 400;

//so the constants above can be in MB. This is just a multiplier.
export const TO_MB = 1000000;