const integration = require("./chartiq-integration");

const FSBLReady = () => {
    integration(window.stxx);
}

if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener("onReady", FSBLReady)
} else {
    window.addEventListener("FSBLReady", FSBLReady)
}
