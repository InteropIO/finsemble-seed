import React from "react";
import ReactDOM from "react-dom";
import Tester from "./components/Tester";
import CodeSnippets from "./components/CodeSnippets";
import Sender from "./components/Sender";

function FDC3Tester() {
	return (
		<div>
			<Sender />
			<Tester />
			<CodeSnippets />
		</div>
	);
}

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
