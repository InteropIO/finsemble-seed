/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

// Static vs Dynamic Toolbar
import Toolbar from "./dynamicToolbar";
// import Toolbar from "./staticToolbar";

function FSBLReady() {
  //Band-aid. Openfin not respecting small bounds on startup.
  if (!FSBL.System.container || FSBL.System.container != "electron") {
    let finWindow = FSBL.System.Window.getCurrent();
    finWindow.getOptions((opts) => {
      if (opts.smallWindow) {
        finWindow.setBounds(opts.defaultLeft, opts.defaultTop, opts.defaultWidth, opts.defaultHeight);
      }
    })
  }
}

if (window.FSBL && FSBL.addEventListener) {
  FSBL.addEventListener("onReady", FSBLReady);
} else {
  window.addEventListener("FSBLReady", FSBLReady);
}
