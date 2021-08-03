import "office-ui-fabric-react/dist/css/fabric.min.css";
import App from "./components/App";
import { initializeIcons } from "office-ui-fabric-react/lib/Icons";
import * as React from "react";
import * as ReactDOM from "react-dom";
/* global AppCpntainer, Component, document, Office, module, require */

initializeIcons();

let isOfficeInitialized = false;

const title = "Finsemble-Excel Task Pane Add-in";

const render = (Component: any) => {
  ReactDOM.render(
      <Component title={title} isOfficeInitialized={isOfficeInitialized} />,
    document.getElementById("container")
  );
};

/* Render application after Office initializes */
Office.initialize = () => {
  isOfficeInitialized = true;
  render(App);
};

// if ((module as any).hot) {
//   (module as any).hot.accept("./components/App", () => {
//     const NextApp = require("./components/App").default;
//     render(NextApp);
//   });
// }
