import React from "react";
import ReactDOM from "react-dom";

import App from './src/app2'

function FinsembleReady() {
  ReactDOM.render(
    <App />
    , document.getElementById("intentResolver-component-wrapper"));
}

if (window.FSBL && FSBL.addEventListener) {
  FSBL.addEventListener("onReady", FinsembleReady);
} else {
  window.addEventListener("FinsembleReady", FinsembleReady)
}
