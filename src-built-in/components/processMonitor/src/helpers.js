import {  SIMPLE_MODE_STATISTICS } from "./constants";

// This Is Proper Case
export function toProperCase(str) {
    return str
        .replace(/([A-Z])/g, ' $1')
        // uppercase the first character
        .replace(/^./, function (str) { return str.toUpperCase(); })
}
/**
 * Given a number, will return a nice string, 1000 will return 1KB, 100 will return 100 Bytes, and so on.
 * @param {number} bytes
 */
export function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

/**
 * Handler for Array.reduce. It takes the array of statistics and sums each value. This outputs a nice object that has our total CPU and memory consumption.
 * @param {*} prev
 * @param {*} curr
 */
export function statReducer(prev, curr) {
    let ret = {
        name: "Totals",
        uuid: "Totals",
        statistics: {}
    };
    SIMPLE_MODE_STATISTICS.forEach(stat => {
        ret.statistics[stat.value] = prev.statistics[stat.value] + curr.statistics[stat.value];
    });
    return ret;
}

/**
 * Convenience function for rounding numbers.
 * @param {*} number
 * @param {*} precision
 */
export function round(number, precision) {
    var shift = function (number, precision, reverseShift) {
        if (reverseShift) {
            precision = -precision;
        }
        var numArray = ("" + number).split("e");
        return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
    };
    return shift(Math.round(shift(number, precision, false)), precision, true);
}

/**
 * Outputs something nice,. 102423465243 outputs whatever that number is in KB/MB/GB.
 * 0.035123 will output 0.35% for CPU.
 * @param {number} number
 * @param {string} statType
 */
export function prettyPrint(number, statType) {
    if (statType === "CPU") {
        //make it a percent.
        return round(number, 2) + "%";
    } else if (statType !== "PID") {
        return bytesToSize(number);
    } else {
        return number;
    }
}
