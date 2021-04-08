import ExcelFile from "./types/ExcelFile";
import { v4 as uuidV4 } from "uuid";
import { Bookmark, ExcelAction } from "./types/types";
import * as CONSTANTS from "./config/const";

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
        break;
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
          case CONSTANTS.ADDIN_OPENED:
            let file = this.activeExcelFiles.find((file) => {
              return file.fileName == res.data.fileName;
            });

            let fileToSend = file;
            if (!file) {
              let newExcelfile = new ExcelFile(
                res.data.fileName,
                res.data.fileUrl,
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
            } else {
              file.createTimestamp = res.data.timestamp;
              file.aliveTimestamp = res.data.timestamp;
              this.addSheetChangeHandler(file);
            }

            this.bookmarkStore.getValue(
              "bookmarks",
              (err: any, bookmarks: Array<Bookmark>) => {
                if (!err) {
                  this.sendBookmarks({
                    excelFile: fileToSend,
                    bookmarks: bookmarks,
                  });
                }
              }
            );

            this.transmitActiveFilesChange();
            break;
          case CONSTANTS.BROADCAST_DATA:
            let tempActions = this.excelActions.filter((action) => {
              return action.action === CONSTANTS.BROADCAST_DATA;
            });
            tempActions.forEach((action) => {
              Finsemble.Clients.RouterClient.transmit(action.id, {
                data: res.data,
              });
            });
            break;

          default:
            break;
        }
      }
    }
  };

  // handleQueryResponse: StandardCallback = (err, res) => {
  // 	if (!err) {
  // 		console.log(res);
  // 	} else {
  // 		console.log(err)
  // 	}
  // }

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
          case CONSTANTS.SHEET_CHANGE:
            let changeAddress = res.data.eventObj.address;
            let changeWorksheet = res.data.eventObj.worksheet;
            let tempActions = this.excelActions.filter((action) => {
              if(action.bookmark)
                return (
                  action.action === CONSTANTS.CHANGE_SUBSCRIPTION &&
                  action.file?.fileName === res.data.fileName &&
                  action.bookmark?.worksheet.id === changeWorksheet.id &&
                  checkRangeInRange(changeAddress, action.bookmark?.range)
                );
              else
              return (
                action.action === CONSTANTS.CHANGE_SUBSCRIPTION &&
                action.file?.fileName === res.data.fileName &&
                checkRangeInRange(changeAddress, null)
              );
            });
            tempActions.forEach((action) => {
              Finsemble.Clients.RouterClient.transmit(action.id, {
                event: res.data.eventObj,
                fileName: res.data.fileName,
              });
            });

            break;
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

                  let result = bookmarks.filter((bookmark, index) => {
                    if (bookmark.name === res.data.eventObj.name) {
                      bookmarks[index] = bookmarkToCreate;
                    }
                    return bookmark.name === res.data.eventObj.name;
                  });
                  if (result.length == 0) {
                    bookmarks.push(bookmarkToCreate);
                  }
                  this.bookmarkStore.setValue({
                    field: "bookmarks",
                    value: bookmarks,
                  });
                  this.sendBookmarks({
                    excelFile: bookmarkToCreate.excelFile,
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
                    excelFile: bookmarkToDelete.excelFile,
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

        this.transmitActiveFilesChange();
      }
    });
  };

  transmitActiveFilesChange = () => {
    let tempActions = this.excelActions.filter((action) => {
      return action.action === CONSTANTS.SUBSCRIBE_ACTIVE_EXCEL_FILES;
    });
    tempActions.forEach((action) => {
      Finsemble.Clients.RouterClient.transmit(action.id, {
        ACTIVE_EXCEL_FILES: this.activeExcelFiles,
      });
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
        case CONSTANTS.SUBSCRIBE_ACTIVE_EXCEL_FILES:
          let sub_excel_files_uuid = this.getUuid();
          let tempAction: ExcelAction = {
            id: sub_excel_files_uuid,
            action: action,
            file: null,
            bookmark: null,
          };
          returnArray.push(tempAction);
          this.excelActions.push(tempAction);
          break;
        case CONSTANTS.BROADCAST_DATA:
          let broadcast_data_uuid = this.getUuid();
          let broadcast_data_action: ExcelAction = {
            id: broadcast_data_uuid,
            action: action,
            file: null,
            bookmark: null,
          };
          returnArray.push(broadcast_data_action);
          this.excelActions.push(broadcast_data_action);
          break;
        case CONSTANTS.GET_EXCEL_CELL_DATA:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let get_excel_cell_data_uuid = this.getUuid();
            returnArray.push({
              id: get_excel_cell_data_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(get_excel_cell_data_uuid, this.getExecelCellData);
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
        case CONSTANTS.SET_EXCEL_CELL_DATA:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let get_excel_cell_data_uuid = this.getUuid();
            returnArray.push({
              id: get_excel_cell_data_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(get_excel_cell_data_uuid, this.setExecelCellData);
          });
          break;
        case CONSTANTS.SUBSCRIBE_SHEET_CHANGE:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let tempSubSheetChangeAction = this.excelActions.find(
              (tempAction: ExcelAction) => {
                return (
                  tempAction.action === CONSTANTS.SUBSCRIBE_SHEET_CHANGE &&
                  tempAction.file?.fileName === excelFile.fileName
                );
              }
            );
            if (!tempSubSheetChangeAction) {
              let sub_sheet_change_uuid = this.getUuid();
              let tempSheetChangeAction: ExcelAction = {
                id: sub_sheet_change_uuid,
                action: action,
                file: excelFile,
                bookmark: null,
              };
              returnArray.push(tempSheetChangeAction);
              this.excelActions.push(tempSheetChangeAction);
              this.addSheetChangeHandler(excelFile);
            } else {
              returnArray.push(tempSubSheetChangeAction);
            }
          });
          break;
        case CONSTANTS.CHANGE_SUBSCRIPTION:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let change_subscription_uuid = this.getUuid();
            let changeSubscriptionAction: ExcelAction = {
              id: change_subscription_uuid,
              action: action,
              file: excelFile,
              bookmark: data.params.bookmark,
            };
            returnArray.push(changeSubscriptionAction);
            this.excelActions.push(changeSubscriptionAction);
          });
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
        case CONSTANTS.PASTE_TO_EXCEL:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let paste_to_excel_uuid = this.getUuid();
            returnArray.push({
              id: paste_to_excel_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(paste_to_excel_uuid, this.pasteToExcel);
          });
          break;
        case CONSTANTS.FOCUS_RANGE:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let focus_range_uuid = this.getUuid();
            returnArray.push({
              id: focus_range_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(focus_range_uuid, this.focusRange);
          });
          break;
        case CONSTANTS.CLEAR_RANGE:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let clear_range_uuid = this.getUuid();
            returnArray.push({
              id: clear_range_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(clear_range_uuid, this.clearRange);
          });
          break;
        case CONSTANTS.COPY_RANGE:
          data.excelFiles.forEach((excelFile: ExcelFile) => {
            let copy_range_uuid = this.getUuid();
            returnArray.push({
              id: copy_range_uuid,
              action: action,
              file: excelFile,
            });
            this.addResponder(copy_range_uuid, this.copyRange);
          });
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

  getExecelCellData = async (data: any) => {
    console.log(
      "getExecelCellData",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.GET_RANGE_DATA,
        startCell: data.startCell,
        endCell: data.endCell,
        worksheetName: data.worksheetName,
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  setExecelCellData = async (data: any) => {
    console.log(
      "setExecelCellData",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.SET_RANGE_DATA,
        startCell: data.startCell,
        endCell: data.endCell,
        worksheetName: data.worksheetName,
        values: data.values,
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
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

  pasteToExcel = async (data: any) => {
    console.log(
      "pasteToExcel",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    console.log({
      action: CONSTANTS.PASTE_TO_EXCEL,
      excelFile: data.excelFile,
      range: data.range,
      worksheet: data.worksheet,
      data: data.data,
    });
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.PASTE_TO_EXCEL,
        excelFile: data.excelFile,
        range: data.range,
        worksheet: data.worksheet,
        data: data.data,
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  focusRange = async (data: any) => {
    console.log(
      "focusRange",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.FOCUS_RANGE,
        worksheet: data.worksheet,
        range: data.range,
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  clearRange = async (data: any) => {
    console.log(
      "clearRange",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.CLEAR_RANGE,
        worksheet: data.worksheet,
        range: data.range,
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };

  copyRange = async (data: any) => {
    console.log(
      "copyRange",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.COPY_RANGE,
        worksheet: data.worksheet,
        range: data.range,
      },
      (err: any, res: any) => {}
    );
    return res.response.data.result;
  };

  sendBookmarks = async (data: any) => {
    console.log(
      "sendBookmarks",
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`
    );
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: CONSTANTS.SEND_BOOKMARKS,
        bookmarks: data.bookmarks,
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };
}

const checkRangeInRange = (range: string, targetRange: string | undefined| null) => {
  console.log(range, targetRange);
  if (targetRange) {
    if (range.indexOf(":") > 0) {
      // range in format A1:C3
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
