/**
 * The function that every component would call. It makes sure finsemble services are ready before any rendering of the component.
 * @param renderFunc The function that renders the react component
 * i.e. ReactDOM.render(<Linker />, document.getElementById("main")
 */
const onReady = (renderFunc: EventListenerOrEventListenerObject) => {
    if (window.FSBL && FSBL.addEventListener) {
        FSBL.addEventListener("onReady", renderFunc);
    } else {
        window.addEventListener("FSBLReady", renderFunc);
    }
}

export default onReady;