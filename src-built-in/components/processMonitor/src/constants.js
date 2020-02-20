//Stats to parse. Comment out statistics if they interest you.
export const SIMPLE_MODE_STATISTICS = [
	{ label: "CPU", value: "cpuUsage" },
	{ label: "Memory", value: "workingSetSize" }
];
//Same as Simple, but we also give peak memory.
export const ADVANCED_MODE_STATISTICS = [
	{ label: "CPU", value: "cpuUsage" },
	{ label: "Memory", value: "workingSetSize" },
	{ label: "Peak Memory", value: "peakWorkingSetSize" },
	{ label: "PID", value: "processId" }

];
//These are percentages
export const HIGH_CPU = 10;
export const MODERATE_CPU_USAGE = 5;

//Usage in MB
export const MODERATE_MEMORY_USAGE = 250;
export const HIGH_MEMORY_USAGE = 400;

//so the constants above can be in MB. This is just a multiplier.
export const TO_MB = 1000000;

let emptyTotals = { statistics: {} };
//Just an object to hold the UI over until we get real information from the system.
SIMPLE_MODE_STATISTICS.forEach(stat => {
	emptyTotals.statistics[stat.value] = 0;
});

export const EMPTY_TOTALS = emptyTotals;