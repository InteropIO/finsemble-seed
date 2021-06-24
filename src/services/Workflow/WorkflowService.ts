/*!
 * Copyright 2017 by ChartIQ, Inc.
 * All rights reserved.
 */

import {workflows} from "./const/Workflows"

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
  workflowStore: any;

  constructor(params: {
    name: string;
    startupDependencies: {
      services: string[];
      clients: string[];
    };
  }) {
    super(params);
    this.initialize = this.initialize.bind(this);
    this.setupWorkflowSetting = this.setupWorkflowSetting.bind(this)
    this.createHotkeys = this.createHotkeys.bind(this)
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
    this.setupWorkflowSetting()
    this.createHotkeys();
  }

  setupWorkflowSetting() {
    Finsemble.Clients.DistributedStoreClient.getStore({ store: "WorkflowStore" }, (err, workflowStore) => {
      if(err){
        Logger.error("Failed to get WorkflowStore", err)
      } else {
        this.workflowStore = workflowStore
        this.workflowStore.setValue(
          { field: "workflows", value: workflows },
          (err) => {
            if(err){
              Logger.error("Failed to set WorkflowStore values", err)
            }
          }
        );
        this.workflowStore.addListeners(['initiateWorkflowClipboard','initiateWorkflowInput'], this.createHotkeys, ()=>{
          Logger.info("initiateWorkflowClipboard / initiateWorkflowInput changed, register hotkeys")
        });
      }
    });
  }

  createHotkeys() {
    Finsemble.Clients.HotkeyClient.removeAllHotkeys(() => {});
    Finsemble.Clients.DistributedStoreClient.getStore({ store: "WorkflowStore" }, (err, workflowStore) => {
      if(err){
        Logger.error("Failed to get WorkflowStore", err)
      } else {
        workflowStore.getValues(
          [
            { field: "initiateWorkflowClipboard"},
            { field: "initiateWorkflowInput"}
          ],
          (err, values) => {
            if(err){
              Logger.error("Failed to get WorkflowStore values", err)
            } else {
              Finsemble.Clients.HotkeyClient.addGlobalHotkey(
                values.initiateWorkflowClipboard,
                showInitiateComponentClipboard,
                () => {}
              );
              Finsemble.Clients.HotkeyClient.addGlobalHotkey(
                values.initiateWorkflowInput,
                showInitiateComponentInput,
                () => {}
              );
            }
          }
        );
      }
    });
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
