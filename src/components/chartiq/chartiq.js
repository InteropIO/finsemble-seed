/***********************************************************************************************************************
	Copyright 2017-2020 by ChartIQ, Inc.
	Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
 **********************************************************************************************************************/
const integration = require("./chartiq-integration");
let windowLoaded = false;
let fsblReady = false;
let chartInitialized = false;

window.addEventListener("load", () => {
    windowLoaded = true;
    initChart();
});

const FSBLReady = () => {
    fsblReady = true;
    initChart();
};

const initChart = () => {
    if (windowLoaded && fsblReady && !chartInitialized) {
        integration(window.initBlock());
        chartInitialized = true;
    }
}

if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener("onReady", FSBLReady)
} else {
    window.addEventListener("FSBLReady", FSBLReady)
}
