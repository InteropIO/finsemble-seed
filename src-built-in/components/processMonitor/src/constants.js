//Stats to parse from openfin. Comment out statistics if they interest you.
export const statsWeCareAbout = ["uuid",
	"processId",
	"cpuUsage",
	"workingSetSize",
	"peakWorkingSetSize",
	// "nonPagedPoolUsage",
	// "peakNonPagedPoolUsage",
	// "pagedPoolUsage",
	// "peakPagedPoolUsage",
	// "pagefileUsage",
	// "peakPagefileUsage",
	// "pageFaultCount"
];

/** Metrics get transformed. */
export const NOT_A_METRIC = ["uuid", "processid"];
//UUID is left-aligned.
export const NOT_RIGHT_ALIGNED = ["uuid"];
//
export const CPU_HEADER = "cpuusage";
export const MEMORY_HEADER = "workingsetsize";

//CPU is in %
export const HIGH_CPU = 10;
export const MODERATE_CPU_USAGE = 5;

//Usage in MB
export const MODERATE_MEMORY_USAGE = 250;
export const HIGH_MEMORY_USAGE = 400;

//so the constants above can be in MB. This is just a multiplier.
export const TO_MB = 1000000;

//React-table options
export const SHOW_PAGINATION = false;
export const COLLAPSE_ON_DATA_CHANGE = false;
export const TABLE_CLASSES = "app-list -highlight";


let emptyTotals = {};
statsWeCareAbout.forEach(stat => {
    if (NOT_A_METRIC.includes(stat)) {
        emptyTotals[stat] = null;
    } else {
        emptyTotals[stat] = 0;
    }
});
export const EMPTY_TOTALS = emptyTotals;