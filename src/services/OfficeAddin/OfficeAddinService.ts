import ExcelFile from "./types/ExcelFile";
import { v4 as uuidV4 } from "uuid";
import * as CONSTANTS from "./config/const";
import ExcelAction from "./types/ExcelAction";
import ExcelBookmark from "./types/ExcelBookmark";

const Finsemble = require("@finsemble/finsemble-core");

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("OfficeAddin Service starting up");

// Add and initialize any other clients you need to use (services are initialized by the system, clients are not):
// Finsemble.Clients.AuthenticationClient.initialize();
// Finsemble.Clients.ConfigClient.initialize();
// Finsemble.Clients.DialogManager.initialize();
// Finsemble.Clients.DistributedStoreClient.initialize();
// Finsemble.Clients.DragAndDropClient.initialize();
// Finsemble.Clients.LauncherClient.initialize();
// Finsemble.Clients.LinkerClient.initialize();
// Finsemble.Clients.HotkeyClient.initialize();
// Finsemble.Clients.SearchClient.initialize();
// Finsemble.Clients.StorageClient.initialize();
// Finsemble.Clients.WindowClient.initialize();
// Finsemble.Clients.WorkspaceClient.initialize();

/**
 * Add service description here
 */
export default class OfficeAddinService extends Finsemble.baseService {
  private activeExcelFiles: Array<ExcelFile> = [];
  private excelActions: Array<ExcelAction> = [];
  private bookmarkStore: any;
  /**
   * Initializes a new instance of the OfficeAddinService class.
   */
  constructor() {
    super({
      // Declare any client dependencies that must be available before your service starts up.
      startupDependencies: {
        // When ever you use a client API with in the service, it should be listed as a client startup
        // dependency. Any clients listed as a dependency must be initialized at the top of this file for your
        // service to startup.
        clients: [
          // "authenticationClient",
          // "configClient",
          // "dialogManager",
          // "distributedStoreClient",
          // "dragAndDropClient",
          // "hotkeyClient",
          // "launcherClient",
          // "linkerClient",
          // "searchClient
          // "storageClient",
          // "windowClient",
          // "workspaceClient",
        ],
      },
    });

    this.readyHandler = this.readyHandler.bind(this);
    this.onBaseServiceReady(this.readyHandler);
  }

  /**
   * Generates a UUID
   */
  protected getUuid(): string {
    return uuidV4();
  }

  /**
   * Fired when the service is ready for initialization
   * @param {function} callback
   */
  readyHandler(cb: Function) {
    this.createRouterEndpoints();
    this.Logger.log("OfficeAddin Service ready");
    cb();
  }

  /**
   * Creates a router endpoint for you service.
   * Add query responders, listeners or pub/sub topic as appropriate.
   */
  createRouterEndpoints() {
    this.RouterClient.addListener(
      CONSTANTS.FINSEMBLE_EXCEL_EVENT,
      this.handleExcelEvent
    );
    this.addResponder(CONSTANTS.FINSEMBLE_EXCEL_EVENT, this.handleExcelQuery);
    setInterval(this.checkActiveExcelFiles, 1000);
    this.addResponder(CONSTANTS.OFFICE_ADDIN_REGISTER, this.register);

    //Finsemble.Clients.DistributedStoreClient.removeStore({ store: "excelBookmarkStore", global: true }, function (err, bool) {});
    Finsemble.Clients.DistributedStoreClient.getStore(
      { store: "excelBookmarkStore" },
      this.getBookmarkStoreCb
    );

    //Save all Excel files before worksapce reload.
    Finsemble.Clients.WorkspaceClient.addEventListener(
      "close-requested", this.handleWorkspaceClosed.bind(this)
    );
    Finsemble.Clients.WorkspaceClient.addEventListener(
      "save-requested", this.handleWorkspaceClosed.bind(this)
    );
    Finsemble.Clients.WorkspaceClient.addEventListener(
      "save-complete", this.handleWorkspaceClosed.bind(this)
    );
    Finsemble.Clients.WorkspaceClient.addEventListener(
      "save-failed", this.handleWorkspaceClosed.bind(this)
    );

  }
  
  handleWorkspaceClosed (event) {
    event.wait();
    //tell excel to save
    this.activeExcelFiles.forEach(async (file, index, object) => {
      console.log("Saveing file ", file);
      let res = await this.RouterClient.query(
        `query-${file.fileName}-${file.createTimestamp}`,
        { action: CONSTANTS.SAVE_EXCEL_WORKBOOK },
        (err: any, res: any) => {
          if (index == this.activeExcelFiles.length - 1) 
            event.done();
        }
      );
    });
  }

  getBookmarkStoreCb: StandardCallback = (err, storeObject) => {
    if (!err) {
      console.log("Store exist", storeObject);
      this.bookmarkStore = storeObject;
    } else {
      Finsemble.Clients.DistributedStoreClient.createStore(
        {
          store: "excelBookmarkStore",
          global: true,
          persist: true,
          values: { bookmarks: [] },
        },
        this.createBookmarkStoreCb
      );
    }
  };

  createBookmarkStoreCb: StandardCallback = (err, storeObject) => {
    if (!err) {
      console.log("Store created", storeObject);
      this.bookmarkStore = storeObject;
    } else {
    }
  };

  handleExcelQuery = async (data: any) => {
    console.log("handleExcelQuery", data);

    switch (data.event) {
      case "GET_COMPONENT_LIST":
        let list = await Finsemble.Clients.LauncherClient.getComponentList(
          (err: StandardError, list: any) => {}
        );
        let tempList: Array<{}> = [];
        for (var key of Object.keys(list.data)) {
          if (
            list.data[key].foreign.components["App Launcher"].launchableByUser
          ) {
            tempList.push({ key: key, text: key });
          }
        }
        return tempList;
      default:
        break;
    }
  };

  handleExcelEvent: StandardCallback = (err, res) => {
    if (err) {
      this.Logger.error(
        "OfficeAddinService error when handling router message",
        err
      );
    } else {
      if (!res.originatedHere()) {
        // Only handle messages not from the service ifself
        console.log("handleExcelEvent", res.data);

        switch (res.data.event) {
          case CONSTANTS.EXCEL_ADDIN_LOADED:
            let file = this.activeExcelFiles.find((file) => {
              return (
                file.fileName === res.data.fileName &&
                file.filePath === res.data.filePath
              );
            });

            let fileToSend = file;
            if (!file) {
              let newExcelfile = new ExcelFile(
                res.data.fileName,
                res.data.filePath,
                res.data.timestamp,
                res.data.timestamp
              );
              this.activeExcelFiles.push(newExcelfile);
              Finsemble.Clients.RouterClient.addListener(
                `${res.data.fileName}-event`,
                this.handleExcelFileEvent
              );
              fileToSend = newExcelfile;
              this.addSheetChangeHandler(fileToSend);
              this.transmitActiveFilesChange(fileToSend);
            } else {
              file.createTimestamp = res.data.timestamp;
              file.aliveTimestamp = res.data.timestamp;
              this.addSheetChangeHandler(file);
              this.transmitActiveFilesChange(file);
            }

            this.bookmarkStore.getValue(
              "bookmarks",
              (err: any, bookmarks: Array<ExcelBookmark>) => {
                if (!err) {
                  this.sendBookmarks({
                    bookmarks: bookmarks,
                  });
                }
              }
            );

            break;
          default:
            break;
        }
      }
    }
  };

  query(
    channel: string,
    data: {},
    channelPrefix?: string,
    callback?: StandardCallback
  ): Promise<any> {
    return new Promise<{}>(async (resolve, reject) => {
      try {
        this.Logger.system.info(
          `sending message on ${channelPrefix + channel} channel`,
          data
        );

        const response = await this.RouterClient.query(
          channelPrefix + channel,
          data,
          () => {} // Ignoring callback. Use the promise to get the result
        );

        if (response.err) {
          this.Logger.system.error(`Error: `, response.err);
          reject(response.err);
        } else {
          // this.Logger.system.log(`${channel} raw response: `, response);
          if (callback) {
            callback(null, response.response.data);
          }
          resolve(response.response.data);
        }
      } catch (e) {
        this.Logger.system.error(`Error: `, e);
        if (callback) {
          callback(e);
        }
        reject(e);
      }
    });
  }

  /**
   * Helper method utilizing RouterClient's addResponder method
   *
   * @param {string} channel
   * @param {Function} dataProcessor
   * @param {string|null} channelPrefix
   */
  addResponder(
    channel: string,
    dataProcessor: (data: any) => any,
    channelPrefix?: string
  ) {
    if (channelPrefix == null) {
      channelPrefix = "";
    }

    this.Logger.system.info(
      `Adding responder for endpoint: ${channelPrefix + channel}`
    );

    this.RouterClient.addResponder(
      channelPrefix + channel,
      async (err: any, message: any) => {
        this.Logger.system.info(`Message received on ${channel}: `, message);
        if (err) {
          this.Logger.system.error(`Failed to setup ${channel} responder`, err);
          return;
        }

        try {
          this.Logger.system.info(
            `Processing message on channel ${channel}: `,
            message
          );
          const returnVal = await dataProcessor(message.data);
          this.Logger.system.info(
            `Message response on ${channel}: `,
            returnVal
          );
          message.sendQueryResponse(null, {
            status: "success",
            data: returnVal,
          });
        } catch (err) {
          this.Logger.system.error(`Failed to process query`, err);
          message.sendQueryResponse(err);
        }
      }
    );
  }

  handleExcelFileEvent: StandardCallback = (err, res) => {
    if (err) {
      Finsemble.Clients.Logger.error(
        "OfficeAddinService error when handling router message",
        err
      );
    } else {
      if (!res.originatedHere()) {
        console.log("handleExcelFileEvent", res.data);
        let event = res.data.event;
        switch (event) {
          // Bookmark event
          case CONSTANTS.CREATE_BOOKMARK:
            let bookmarkToCreate = res.data.eventObj;
            this.bookmarkStore.getValue(
              "bookmarks",
              (err: any, bookmarks: Array<Bookmark>) => {
                if (!err) {
                  let excelFile = this.activeExcelFiles.filter((file) => {
                    return file.fileName === bookmarkToCreate.excelFileName;
                  });
                  bookmarkToCreate.excelFile = excelFile[0];
                  bookmarkToCreate.id = this.getUuid();
                  bookmarks.push(bookmarkToCreate);

                  this.bookmarkStore.setValue({
                    field: "bookmarks",
                    value: bookmarks,
                  });
                  this.sendBookmarks({
                    bookmarks: bookmarks,
                  });
                }
              }
            );
            break;
          case CONSTANTS.EDIT_BOOKMARK:
            let bookmarkToEdit = res.data.eventObj;
            this.bookmarkStore.getValue(
              "bookmarks",
              (err: any, bookmarks: Array<Bookmark>) => {
                if (!err) {
                  let excelFile = this.activeExcelFiles.filter((file) => {
                    return file.fileName === bookmarkToEdit.excelFileName;
                  });
                  bookmarkToEdit.excelFile = excelFile[0];
                  let result = bookmarks.filter((bookmark, index) => {
                    if (bookmark.id === res.data.eventObj.id) {
                      bookmarks[index].name = bookmarkToEdit.name;
                      bookmarks[index].range = bookmarkToEdit.range;
                      bookmarks[index].openEndedRange =
                        bookmarkToEdit.openEndedRange;
                      bookmarks[index].worksheet = bookmarkToEdit.worksheet;
                    }
                    return bookmark.id === res.data.eventObj.id;
                  });
                  this.bookmarkStore.setValue({
                    field: "bookmarks",
                    value: bookmarks,
                  });
                  this.sendBookmarks({
                    bookmarks: bookmarks,
                  });
                }
              }
            );
            break;

          case CONSTANTS.DELETE_BOOKMARK:
            let bookmarkToDelete = res.data.eventObj;
            this.bookmarkStore.getValue(
              "bookmarks",
              (err: any, bookmarks: Array<Bookmark>) => {
                if (!err) {
                  let filteredBookmarks = bookmarks.filter(
                    (tempBookmark: Bookmark) => {
                      return tempBookmark.name !== bookmarkToDelete.name;
                    }
                  );
                  this.bookmarkStore.setValue({
                    field: "bookmarks",
                    value: filteredBookmarks,
                  });
                  this.sendBookmarks({
                    bookmarks: filteredBookmarks,
                  });
                }
              }
            );
            break;
          case CONSTANTS.OPEN_CREATE_BOOKMARK_PANEL:
            let tempFile = this.activeExcelFiles.find((file) => {
              return file.fileName == res.data.fileName;
            });
            if (tempFile) {
              this.RouterClient.query(
                `query-${tempFile.fileName}-${tempFile.createTimestamp}`,
                { action: CONSTANTS.OPEN_CREATE_BOOKMARK_PANEL },
                (err: any, res: any) => {}
              );
            }
            break;
          case CONSTANTS.OPEN_EXCEL_FILE:
            let currentFile = this.activeExcelFiles.find((file) => {
              return file.fileName == res.data.eventObj.fileName;
            });
            if (!currentFile) {
              Finsemble.Clients.LauncherClient.spawn("Excel", {
                autoFocus: true,
                arguments: `${res.data.eventObj.filePath} /x /a FinsembleExcel`,
              });
            } else {
              Finsemble.Clients.LauncherClient.getActiveDescriptors(
                (error, response) => {
                  if (!error) {
                    let activeDescriptors = response;
                    for (let componentId in activeDescriptors) {
                      if (activeDescriptors.hasOwnProperty(componentId)) {
                        if (componentId.match(/Excel-.*-Finsemble/g)) {
                          if (
                            activeDescriptors[componentId].arguments.includes(
                              res.data.eventObj.filePath
                            )
                          ) {
                            setTimeout(async () => {
                              let {
                                wrap,
                              } = await Finsemble.FinsembleWindow.getInstance(
                                activeDescriptors[componentId]
                              );
                              wrap.bringToFront();
                              this.saveExcelWorkbook({
                                excelFile: currentFile,
                              });
                            }, 500);
                          }
                        }
                      }
                    }
                  }
                }
              );
            }
            break;
          
            // Excel events
          case CONSTANTS.SHEET_SELECTION_CHANGE:
            let selectionRange = res.data.eventObj.range;
            let selectionWorksheet = res.data.eventObj.worksheet;
            let tempSelectionActions = this.excelActions.filter((action) => {
              if(action.action === CONSTANTS.SUBSCRIBE_SHEET_SELECTION_CHANGE){
                if(action.file){
                  if (action.bookmark){
                    if(action.bookmark.range){
                      return action.bookmark?.worksheet.name === selectionWorksheet.name && checkRangeInRange(selectionRange, action.bookmark?.range)
                    } else {
                      return (
                        action.bookmark?.worksheet.name === selectionWorksheet.name
                      );
                    }
                  } else {
                    return (
                      action.file?.fileName === res.data.fileName
                    );
                  }
                } else {
                  return true
                }
              }
            });
            tempSelectionActions.forEach((action) => {
              Finsemble.Clients.RouterClient.transmit(action.id, {
                eventObj: res.data.eventObj,
                excelFile: {fileName: res.data.fileName},
              });
            });
            break;
          case CONSTANTS.SHEET_VALUES_CHANGE:
            let tempValueChangeRange = res.data.eventObj.range;
            let tempValueChangeWorksheet = res.data.eventObj.worksheet;
            let tempValueChangeActions = this.excelActions.filter((action) => {
              if(action.action === CONSTANTS.SUBSCRIBE_SHEET_VALUE_CHANGE){
                if(action.file){
                  if (action.bookmark){
                    if(action.bookmark.range){
                      return action.bookmark?.worksheet.name === tempValueChangeWorksheet.name && checkRangeInRange(tempValueChangeRange, action.bookmark?.range)
                    } else {
                      return (
                        action.bookmark?.worksheet.name === tempValueChangeWorksheet.name
                      );
                    }
                  } else {
                    return (
                      action.file?.fileName === res.data.fileName
                    );
                  }
                } else {
                  return true 
                }
              }
            });
            tempValueChangeActions.forEach((action) => {
              Finsemble.Clients.RouterClient.transmit(action.id, {
                eventObj: res.data.eventObj,
                excelFile: {fileName: res.data.fileName},
              });
            });
            break;
          case CONSTANTS.SHEET_BROADCAST_VALUES:
            let tempBroadcastValuesRange = res.data.eventObj.range;
            let tempBroadcastValuesWorksheet = res.data.eventObj.worksheet;
            let tempBroadcastValuesActions = this.excelActions.filter((action) => {
              if(action.action === CONSTANTS.SUBSCRIBE_SHEET_BROADCAST_VALUES){
                if(action.file){
                  if (action.bookmark){
                    if(action.bookmark.range){
                      return action.bookmark?.worksheet.name === tempBroadcastValuesWorksheet.name && checkRangeInRange(tempBroadcastValuesRange, action.bookmark?.range)
                    } else {
                      return (
                        action.bookmark?.worksheet.name === tempBroadcastValuesWorksheet.name
                      );
                    }
                  } else {
                    return (
                      action.file?.fileName === res.data.fileName
                    );
                  }
                } else {
                  return true 
                }
              }
            });
            tempBroadcastValuesActions.forEach((action) => {
              Finsemble.Clients.RouterClient.transmit(action.id, {
                eventObj: res.data.eventObj,
                excelFile: {fileName: res.data.fileName},
              });
            });
            break;
          default:
            console.log(res.data);
            break;
        }
      }
    }
  };

  checkActiveExcelFiles = () => {
    this.activeExcelFiles.forEach((file, index, object) => {
      this.query(
        `${file.fileName}-${file.createTimestamp}`,
        { action: "HEALTH_CHECK" },
        "query-"
      )
        .then((res) => {
          file.aliveTimestamp = res.timestamp;
        })
        .catch((err) => {
          this.Logger.error(err);
        });
      if (new Date().getTime() - file.aliveTimestamp >= 2000) {
        console.log(`${file.fileName} file/addin closed`);
        this.RouterClient.removeListener(
          `${file.fileName}-event`,
          this.handleExcelFileEvent
        );
        object.splice(index, 1);

        this.transmitActiveFilesChange(file);
      }
    });
  };

  transmitActiveFilesChange = (changedFile) => {
    let tempActions = this.excelActions.filter((action) => {
      return action.action === CONSTANTS.SUBSCRIBE_ACTIVE_EXCEL_FILES_CHANGE;
    });
    tempActions.forEach((action) => {
      if(!action.file){
        Finsemble.Clients.RouterClient.transmit(action.id, {
          changedFile: changedFile,
          ACTIVE_EXCEL_FILES: this.activeExcelFiles,
        });
      } else {
        if(changedFile.fileName === action.file.fileName){
          Finsemble.Clients.RouterClient.transmit(action.id, {
            changedFile: changedFile,
            ACTIVE_EXCEL_FILES: this.activeExcelFiles,
          });
        }
      }
    });
  };

  register = (data: any): any => {
    let actions = data.actions;
    let returnArray: {
      id: string;
      action: string;
      file: ExcelFile | null;
    }[] = [];
    actions.forEach((action: string) => {
      switch (action) {
        case CONSTANTS.GET_ACTIVE_EXCEL_FILES:
          let get_excel_files_uuid = this.getUuid();
          returnArray.push({
            id: get_excel_files_uuid,
            action: action,
            file: null,
          });
          this.addResponder(get_excel_files_uuid, this.getExcelFiles);
          break;
        case CONSTANTS.GET_WORKSHEET_LIST:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let get_worksheet_list_uuid = this.getUuid();
            returnArray.push({
              id: get_worksheet_list_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(get_worksheet_list_uuid, this.getWorksheetList);
          });
          break;
        case CONSTANTS.FOCUS_EXCEL_RANGE:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let focus_range_uuid = this.getUuid();
            returnArray.push({
              id: focus_range_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(focus_range_uuid, this.focusExcelRange);
          });
          break;
        case CONSTANTS.CLEAR_EXCEL_RANGE:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let clear_range_uuid = this.getUuid();
            returnArray.push({
              id: clear_range_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(clear_range_uuid, this.clearExcelRange);
          });
          break;
        case CONSTANTS.GET_EXCEL_RANGE:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let get_excel_range_uuid = this.getUuid();
            returnArray.push({
              id: get_excel_range_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(get_excel_range_uuid, this.getExcelRange);
          });
          break;
        case CONSTANTS.SET_EXCEL_RANGE:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let set_excel_range_uuid = this.getUuid();
            returnArray.push({
              id: set_excel_range_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(set_excel_range_uuid, this.setExcelRange);
          });
          break;
        case CONSTANTS.SET_ACTIVE_WORKSHEET:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let set_active_worksheet_uuid = this.getUuid();
            returnArray.push({
              id: set_active_worksheet_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(set_active_worksheet_uuid, this.setActiveWorksheet);
          });
          break;
        case CONSTANTS.GET_ACTIVE_WORKSHEET:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let get_active_worksheet_uuid = this.getUuid();
            returnArray.push({
              id: get_active_worksheet_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(get_active_worksheet_uuid, this.getActiveWorksheet);
          });
          break;
        case CONSTANTS.CREATE_WORKSHEET:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let create_worksheet_uuid = this.getUuid();
            returnArray.push({
              id: create_worksheet_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(create_worksheet_uuid, this.createWorksheet);
          });
          break;
        case CONSTANTS.DELETE_WORKSHEET:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let delete_worksheet_uuid = this.getUuid();
            returnArray.push({
              id: delete_worksheet_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(delete_worksheet_uuid, this.deleteWorksheet);
          });
          break;
        case CONSTANTS.HIDE_WORKSHEET:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let hide_worksheet_uuid = this.getUuid();
            returnArray.push({
              id: hide_worksheet_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(hide_worksheet_uuid, this.hideWorksheet);
          });
          break;
        case CONSTANTS.UNHIDE_WORKSHEET:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let unhide_worksheet_uuid = this.getUuid();
            returnArray.push({
              id: unhide_worksheet_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(unhide_worksheet_uuid, this.unhideWorksheet);
          });
          break; 
        case CONSTANTS.SAVE_EXCEL_WORKBOOK:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let save_excel_workbook_uuid = this.getUuid();
            returnArray.push({
              id: save_excel_workbook_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(save_excel_workbook_uuid, this.saveExcelWorkbook);
          });
          break;
        // Subscribe to events
        case CONSTANTS.SUBSCRIBE_ACTIVE_EXCEL_FILES_CHANGE:
          if(data.excelFiles){
            data.excelFiles.forEach((excelFile: ExcelFile) => {
              let sub_active_excel_file_change_uuid = this.getUuid();
              let subActiveExcelFilesChangeAction: ExcelAction = {
                id: sub_active_excel_file_change_uuid,
                action: action,
                file: excelFile,
                bookmark: null,
              };
              returnArray.push(subActiveExcelFilesChangeAction);
              this.excelActions.push(subActiveExcelFilesChangeAction);
            });
          } else {
            let sub_active_excel_file_change_uuid = this.getUuid();
            let subActiveExcelFilesChangeAction: ExcelAction = {
              id: sub_active_excel_file_change_uuid,
              action: action,
              file: null,
              bookmark: null,
            };
            returnArray.push(subActiveExcelFilesChangeAction);
            this.excelActions.push(subActiveExcelFilesChangeAction);
          }
          break;
        case CONSTANTS.SUBSCRIBE_SHEET_SELECTION_CHANGE:
          let tempSelectionBookmark;
          if(data.worksheet){
            tempSelectionBookmark = {
              worksheet: data.worksheet,
              range: data.range
            }
          }

          if(data.excelFiles){
            data.excelFiles.forEach((excelFile: ExcelFile) => {
              let sub_selection_change_uuid = this.getUuid();
              let subSelectionChangeAction: ExcelAction = {
                id: sub_selection_change_uuid,
                action: action,
                file: excelFile,
                bookmark: tempSelectionBookmark,
              };
              returnArray.push(subSelectionChangeAction);
              this.excelActions.push(subSelectionChangeAction);
            });
          } else {
            let sub_selection_change_uuid = this.getUuid();
            let subSelectionChangeAction: ExcelAction = {
              id: sub_selection_change_uuid,
              action: action,
              file: null,
              bookmark: tempSelectionBookmark,
            };
            returnArray.push(subSelectionChangeAction);
            this.excelActions.push(subSelectionChangeAction);
          }
          break;
        case CONSTANTS.SUBSCRIBE_SHEET_VALUE_CHANGE:
          let tempValueChangeBookmark;
          if(data.worksheet){
            tempValueChangeBookmark = {
              worksheet: data.worksheet,
              range: data.range
            }
          }

          if(data.excelFiles){
            data.excelFiles.forEach((excelFile: ExcelFile) => {
              let sub_value_change_uuid = this.getUuid();
              let subValueChangeAction: ExcelAction = {
                id: sub_value_change_uuid,
                action: action,
                file: excelFile,
                bookmark: tempValueChangeBookmark,
              };
              returnArray.push(subValueChangeAction);
              this.excelActions.push(subValueChangeAction);
            });
          } else {
            let sub_value_change_uuid = this.getUuid();
            let subValueChangeAction: ExcelAction = {
              id: sub_value_change_uuid,
              action: action,
              file: null,
              bookmark: tempValueChangeBookmark,
            };
            returnArray.push(subValueChangeAction);
            this.excelActions.push(subValueChangeAction);
          }
          break;
        case CONSTANTS.SUBSCRIBE_SHEET_BROADCAST_VALUES:
          let tempBroadcstValueBookmark;
          if(data.worksheet){
            tempBroadcstValueBookmark = {
              worksheet: data.worksheet,
              range: data.range
            }
          }

          if(data.excelFiles){
            data.excelFiles.forEach((excelFile: ExcelFile) => {
              let sub_broadcst_value_uuid = this.getUuid();
              let subBroadcstValueAction: ExcelAction = {
                id: sub_broadcst_value_uuid,
                action: action,
                file: excelFile,
                bookmark: tempBroadcstValueBookmark,
              };
              returnArray.push(subBroadcstValueAction);
              this.excelActions.push(subBroadcstValueAction);
            });
          } else {
            let sub_broadcst_value_uuid = this.getUuid();
            let subBroadcstValueAction: ExcelAction = {
              id: sub_broadcst_value_uuid,
              action: action,
              file: null,
              bookmark: tempBroadcstValueBookmark,
            };
            returnArray.push(subBroadcstValueAction);
            this.excelActions.push(subBroadcstValueAction);
          }
          break;
        default:
          break;
      }
    });
    return returnArray;
  };

  getExcelFiles = (data: any): Array<ExcelFile> => {
    return this.activeExcelFiles;
  };

  saveExcelWorkbook = async (data: any) => {
    console.log(
      "saveExcelWorkbook",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      { action: CONSTANTS.SAVE_EXCEL_WORKBOOK },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  addSheetChangeHandler = async (file: ExcelFile) => {
    console.log(
      "addSheetChangeHandler",
      `query-${file.fileName}-${file.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${file.fileName}-${file.createTimestamp}`,
      { action: "SUBSCRIBE_SHEET_CHANGE" },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  getWorksheetList = async (data: any) => {
    console.log(
      "getWorksheetList",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      { action: CONSTANTS.GET_WORKSHEET_LIST },
      (err: any, res: any) => {}
    );
    return res.response.data.worksheetList;
  };

  focusExcelRange = async (data: any) => {
    console.log(
      "focusRange",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.FOCUS_EXCEL_RANGE,
        worksheet: data.worksheet,
        range: data.range,
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  clearExcelRange = async (data: any) => {
    console.log(
      "clearRange",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.CLEAR_EXCEL_RANGE,
        worksheet: data.worksheet,
        range: data.range,
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  getExcelRange = async (data: any) => {
    console.log(
      "getExcelRange",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.GET_EXCEL_RANGE,
        worksheet: data.worksheet,
        range: data.range,
      },
      (err: any, res: any) => {}
    );
    console.log(res.response.data)
    return res.response.data;
  };

  setExcelRange = async (data: any) => {
    console.log(
      "setExcelRange",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.SET_EXCEL_RANGE,
        worksheet: data.worksheet,
        range: data.range,
        values: data.values
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  setActiveWorksheet = async (data: any) => {
    console.log(
      "setActiveWorksheet",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.SET_ACTIVE_WORKSHEET,
        worksheet: data.worksheet
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  getActiveWorksheet = async (data: any) => {
    console.log(
      "getActiveWorksheet",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.GET_ACTIVE_WORKSHEET
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  createWorksheet = async (data: any) => {
    console.log(
      "createWorksheet",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.CREATE_WORKSHEET,
        worksheet: data.worksheet
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  deleteWorksheet = async (data: any) => {
    console.log(
      "deleteWorksheet",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.DELETE_WORKSHEET,
        worksheet: data.worksheet
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  hideWorksheet = async (data: any) => {
    console.log(
      "hideWorksheet",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.HIDE_WORKSHEET,
        worksheet: data.worksheet
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  unhideWorksheet = async (data: any) => {
    console.log(
      "unhideWorksheet",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.UNHIDE_WORKSHEET,
        worksheet: data.worksheet
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  sendBookmarks = async (data: any) => {
    this.activeExcelFiles.forEach(async (activeExcelFile) => {
      let res = await this.RouterClient.query(
        `query-${activeExcelFile.fileName}-${activeExcelFile.createTimestamp}`,
        {
          action: CONSTANTS.BOOKMARK_LIST,
          bookmarks: data.bookmarks,
        },
        (err: any, res: any) => {}
      );
    });

    return "";
  };
}

const checkRangeInRange = (
  range: string,
  targetRange: string | undefined | null
) => {
  if (targetRange) {
    if (range.indexOf(":") > 0) {
      // range in format A1:C3
      let topLeft = range.split(":")[0];
      let bottomRight = range.split(":")[1];
      let topRight = strRemoveNum(bottomRight) + strRemoveChar(topLeft);
      let bottomLeft = strRemoveNum(topLeft) + strRemoveChar(bottomRight);
      return (
        checkRangeInRange(topLeft, targetRange) ||
        checkRangeInRange(bottomRight, targetRange) ||
        checkRangeInRange(topRight, targetRange) ||
        checkRangeInRange(bottomLeft, targetRange)
      );
    } else {
      // range in format A1
      let rangeCol = convertExcelColToNum(strRemoveNum(range));
      let rangeRow = strRemoveChar(range);
      let startTargetRange = targetRange.split(":")[0];
      let endTargetRange = targetRange.split(":")[1];
      let startTargetRangeCol = convertExcelColToNum(
        strRemoveNum(startTargetRange)
      );
      let startTargetRangeRow = strRemoveChar(startTargetRange);
      let endTargetRangeCol = convertExcelColToNum(
        strRemoveNum(endTargetRange)
      );
      let endTargetRangeRow = strRemoveChar(endTargetRange);

      // console.log(range, rangeCol, rangeRow);
      // console.log(startTargetRange, startTargetRangeCol, startTargetRangeRow);
      // console.log(endTargetRange, endTargetRangeCol, endTargetRangeRow);
      return (
        startTargetRangeCol <= rangeCol &&
        rangeCol <= endTargetRangeCol &&
        startTargetRangeRow <= rangeRow &&
        rangeRow <= endTargetRangeRow
      );
    }
  } else {
    return true;
  }
};

const convertNumToExcelCol = (n: number) => {
  var ordA = "a".charCodeAt(0);
  var ordZ = "z".charCodeAt(0);
  var len = ordZ - ordA + 1;

  var s = "";
  while (n >= 0) {
    s = String.fromCharCode((n % len) + ordA) + s;
    n = Math.floor(n / len) - 1;
  }
  return s.toUpperCase();
};

const convertExcelColToNum = (val: string) => {
  var base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    i,
    j,
    result = 0;

  for (i = 0, j = val.length - 1; i < val.length; i += 1, j -= 1) {
    result += Math.pow(base.length, j) * (base.indexOf(val[i]) + 1);
  }

  return result;
};

const strRemoveNum = (str: string) => {
  return str.replace(/[0-9]/g, "");
};

const strRemoveChar = (str: string) => {
  return parseInt(str.replace(/^\D+/g, ""));
};

const serviceInstance = new OfficeAddinService();

serviceInstance.start();
