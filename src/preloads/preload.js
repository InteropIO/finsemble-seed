const preloadhandler = () => {
    console.log('preloadhandler')
}


// Startup pattern for preload. Preloads can come in any order, so we need to wait on either the window event or the
// FSBL event
if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener("onReady", preloadhandler);
} else {
    window.addEventListener("FSBLReady", preloadhandler);
}