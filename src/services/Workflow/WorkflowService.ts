/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */

const Finsemble = require("@finsemble/finsemble-core");
const BaseService = Finsemble.baseService;
const {
  RouterClient,
  LinkerClient,
  DialogManager,
  WindowClient,
  LauncherClient,
  DistributedStoreClient,
  Logger,
} = Finsemble.Clients;

DialogManager.initialize();
LauncherClient.initialize();
Logger.start();
WindowClient.initialize();
DistributedStoreClient.initialize();

Logger.log("WorkflowService starting up");

class WorkflowService extends BaseService {
  constructor(params: {
    name: string;
    startupDependencies: {
      services: string[];
      clients: string[];
    };
  }) {
    super(params);
    this.initialize = this.initialize.bind(this);
    this.onBaseServiceReady(this.initialize);
    this.start();
    //Logger.log("WorkflowService started");
  }
  /**
   * Initializes service variables
   * @private
   */
  async initialize(cb: () => void) {
    this.createRouterEndpoints();

    console.log("WorkflowService initialized");
    cb();
  }

  /**
   * Creates router endpoints for all of our client APIs. Add servers or listeners for requests coming from your clients.
   * @private
   */
  createRouterEndpoints() {
    console.log("createRouterEndpoints");

    this.createHotkeys();
  }

  createHotkeys() {
    Finsemble.Clients.HotkeyClient.removeAllHotkeys(() => {});
    Finsemble.Clients.ConfigClient.getValues(
      ["finsemble.custom.initiateWorkflowClipboard", "finsemble.custom.initiateWorkflowInput"],
      (err, values) => {
        if (err) {
          console.log(err);
        } else {
          Finsemble.Clients.HotkeyClient.addGlobalHotkey(
            values['finsemble.custom.initiateWorkflowClipboard'],
            showInitiateComponentClipboard,
            () => {}
          );
          Finsemble.Clients.HotkeyClient.addGlobalHotkey(
            values['finsemble.custom.initiateWorkflowInput'],
            showInitiateComponentInput,
            () => {}
          );
        }
      }
    );
  }
}

const showInitiateComponentClipboard = () => {
  Finsemble.Clients.LauncherClient.showWindow(
    { componentType: "InitiateWorkflow" },
    {
      spawnIfNotFound: true,
      data: { mode: "clipboard" },
      addToWorkspace: false,
      autoFocus: true,
      left: "center",
      top: "center",
    },
    (err, res) => {}
  );
};

const showInitiateComponentInput = () => {
  Finsemble.Clients.LauncherClient.showWindow(
    { componentType: "InitiateWorkflow" },
    {
      spawnIfNotFound: true,
      data: { mode: "input" },
      addToWorkspace: false,
      autoFocus: true,
      left: "center",
      top: "center",
    },
    (err, res) => {}
  );
};

const serviceInstance = new WorkflowService({
  name: "Workflow",
  startupDependencies: {
    // add any services or clients that should be started before your service
    services: [],
    clients: [],
  },
});

serviceInstance.start();
export default serviceInstance;
