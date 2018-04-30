export function toProperCase(str) {
    return str
        .replace(/([A-Z])/g, ' $1')
        // uppercase the first character
        .replace(/^./, function (str) { return str.toUpperCase(); })
}

export function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

import { NOT_A_METRIC, statsWeCareAbout } from "./constants";
export function statReducer(prev, curr) {
    let ret = {
        name: "Totals",
        uuid: "Totals"
    };
    statsWeCareAbout.forEach(stat => {
        if (!NOT_A_METRIC.includes(stat)) {
            ret[stat] = prev[stat] + curr[stat];
        }
    });
    return ret;
}

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