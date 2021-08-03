/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global global, Office, self, window */

import FpeRouter from "@chartiq/fpe-router";

const finsembleRouter = FpeRouter.router;
const LauncherClient = FpeRouter.LauncherClient;
const launcherClient = new LauncherClient(finsembleRouter);
var fileName = ''
Office.onReady(() => {
  // If needed, Office.js is ready to be called
  Office.context.document.settings.set("finsemble-excel", true);
  Office.context.document.settings.set("Office.AutoShowTaskpaneWithDocument", true);
  
  //Office.addin.setStartupBehavior(Office.StartupBehavior.load)
  Office.context.document.settings.saveAsync();

  Office.context.document.getFilePropertiesAsync((asyncResult) => {
    var fileUrl = asyncResult.value.url;
    fileName = fileUrl.replace(/^.*[\\\/]/, '')
  })
});

/**
 * Shows a notification when the add-in command is executed.
 * @param event
 */
const action = (event: Office.AddinCommands.Event) => {
  const message: Office.NotificationMessageDetails = {
    type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
    message: "Performed action.",
    icon: "Icon.80x80",
    persistent: true
  };

  // Show a notification message
  Office.context?.mailbox?.item?.notificationMessages?.replaceAsync("action", message);

  // Be sure to indicate when the add-in command function is complete
  event.completed();
};

const spawn = (event: Office.AddinCommands.Event) => {
  launcherClient.Spawn("Welcome Component");
  event.completed();
};

const broadcastData = (event: Office.AddinCommands.Event) => {
  Excel.run(context => {
    let worksheet = context.workbook.worksheets.getActiveWorksheet();
    worksheet.load("items/name");
    let range = context.workbook.getSelectedRange();
    range.load("address, values");
    return context.sync().then(() => {
      finsembleRouter.transmit(`${fileName}-event`, {
        event: "SHEET_BROADCAST_VALUES",
        eventObj: {
          worksheet: worksheet,
          range: range.address.split("!")[1],
          values: range.values,
          params: {value:"test"}
        },
        fileName: fileName
      });
      event.completed();
    });
  }).catch(console.log);
};

const createBookmark = (event: Office.AddinCommands.Event) => {
  Office.addin.showAsTaskpane().then(()=>{
    finsembleRouter.transmit(`${fileName}-event`, { event: 'OPEN_CREATE_BOOKMARK_PANEL', fileName: fileName })
    event.completed();
  })
};

const getGlobal = () => {
  return typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : undefined;
};

const g = getGlobal() as any;

// the add-in command functions need to be available in global scope
g.action = action;
g.spawn = spawn;
g.broadcastData = broadcastData;
g.createBookmark = createBookmark;
