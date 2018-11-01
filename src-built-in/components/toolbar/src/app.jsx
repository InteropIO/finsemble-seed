/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/

// Static vs Dynamic Toolbar
import Toolbar from "./dynamicToolbar";
// import Toolbar from "./staticToolbar";
//Band-aid. Openfin not respecting small bounds on startup.
if (!fin.container || fin.container != "electron") {
  fin.desktop.main(() => {
    let finWindow = fin.desktop.Window.getCurrent();
    finWindow.getOptions((opts) => {
      if (opts.smallWindow) {
        finWindow.setBounds(opts.defaultLeft, opts.defaultTop, opts.defaultWidth, opts.defaultHeight);
      }
    })
  })
}
