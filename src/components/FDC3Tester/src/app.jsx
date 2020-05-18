import React from "react";
import ReactDOM from "react-dom";
import Tester from './components/Tester'

function FDC3Tester() {

	return (
		<div>

		</div>
	);

}
//for debugging.
window.FDC3TesterStore = FDC3TesterStore;

// render component when FSBL is ready.
const FSBLReady = () => {
	ReactDOM.render(
		<FDC3Tester />,
		document.getElementById("FDC3Tester-component-wrapper")
	);
};

if (window.FSBL && FSBL.addEventListener) {
	FSBL.addEventListener("onReady", FSBLReady);
} else {
	window.addEventListener("FSBLReady", FSBLReady);
}
