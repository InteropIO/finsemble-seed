import React from "react";
import ReactDom from "react-dom";
import App from "./App";

const FSBLReady = () => {
	try {
		ReactDom.render(<App />, document.getElementById("notifications-toaster"));
	} catch (e) {
		FSBL.Clients.Logger.error(e);
	}
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
