function createLinkage() {
    // Subscribe to changes on to the topic called account
    // These changes will be reflected when using the same linker channel as
    // accountList and accountDetail
    FSBL.Clients.LinkerClient.subscribe("account", function (obj) {
        displayAccount(obj);
    });
}

// Add your code or functions here and it will be executed as soon as the preload is added
function runPreload() {
    createLinkage()
}

// This code ensures that the FSBL library has been initialized
if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener("onReady", runPreload);
} else {
    window.addEventListener("FSBLReady", runPreload);
}