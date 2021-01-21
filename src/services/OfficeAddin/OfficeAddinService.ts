import ExcelFile from "./types/ExcelFile";
import { v4 as uuidV4 } from "uuid";
import { ExcelAction } from "./types/types";

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
      "finsemble-excel-event",
      this.handleExcelEvent
    );
    setInterval(this.checkActiveExcelFiles, 1000);
    this.addResponder("OFFICE_ADDIN_REGISTER", this.register);
  }

  /**
   * Generates a UUID
   */
  protected getUuid(): string {
    return uuidV4();
  }

  handleExcelEvent: StandardCallback = (err, res) => {
    if (err) {
      this.Logger.error(
        "OfficeAddinService error when handling router message",
        err
      );
    } else {
      if (!res.originatedHere()) {
        // Only handle messages not from the service ifself
        console.log(res.data);

        switch (res.data.event) {
          case "ADDIN_OPENED":
            let file = this.activeExcelFiles.find((file) => {
              return file.fileName == res.data.fileName;
            });

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
            } else {
              file.createTimestamp = res.data.timestamp;
              file.aliveTimestamp = res.data.timestamp;
            }

            this.transmitActiveFilesChange();

            //Finsemble.Clients.RouterClient.query(`${this.fileList[0].fileName}-${this.fileList[0].timestamp}-query`, { action:'GET_CELL_DATA', row:1, col:1, sheetName: 'Sheet1' }, this.handleQueryResponse);
            //Finsemble.Clients.RouterClient.query(`${this.fileList[0].fileName}-${this.fileList[0].timestamp}-query`, { action:'SET_RANGE_DATA', startCell:'A1', endCell:'A1', values:[['test']], sheetName: 'Sheet1' }, this.handleQueryResponse);
            //Finsemble.Clients.RouterClient.query(`${this.fileList[0].fileName}-${this.fileList[0].timestamp}-query`, { action:'SET_RANGE_DATA', startCell:'A1', endCell:'C1', values:[['A1', 'B1', 'C1']], sheetName: 'Sheet1' }, this.handleQueryResponse);
            //Finsemble.Clients.RouterClient.query(`${this.fileList[0].fileName}-${this.fileList[0].timestamp}-query`, { action:'SET_RANGE_DATA', startCell:'A1', endCell:'C3', values:[['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], ['A3', 'B3', 'C3']], sheetName: 'Sheet1' }, this.handleQueryResponse);
            //Finsemble.Clients.RouterClient.query(`${this.fileList[0].fileName}-${this.fileList[0].timestamp}-query`, { action:'GET_RANGE_DATA', startCell:'A1', endCell:'C3', sheetName: 'Sheet1' }, this.handleQueryResponse);
            //Finsemble.Clients.RouterClient.query(`${this.fileList[0].fileName}-${this.fileList[0].timestamp}-query`, { action:'CREATE_WORKSHEET', worksheetName: 'test5'},this.handleQueryResponse)
            //Finsemble.Clients.RouterClient.query(`${this.fileList[0].fileName}-${this.fileList[0].timestamp}-query`, { action:'CREATE_WORKBOOK'},this.handleQueryResponse)
            //Finsemble.Clients.RouterClient.query(`${this.fileList[0].fileName}-${this.fileList[0].timestamp}-query`, { action:'SAVE_WORKBOOK'},this.handleQueryResponse)
            //Finsemble.Clients.RouterClient.query(`${this.fileList[0].fileName}-${this.fileList[0].timestamp}-query`, { action:'CLOSE_WORKBOOK'},this.handleQueryResponse)

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
        let event = res.data.event;
        switch (event) {
          case "SHEET_CHANGE_HANDLER_ADDED":
            console.log("SHEET_CHANGE_HANDLER_ADDED");
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
    let tempActions: Array<ExcelAction> = [];
    this.excelActions.forEach((action) => {
      if (action.action === "SUBSCRIBE_ACTIVE_EXCEL_FILES") {
        tempActions.push(action);
      }
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
        case "GET_ACTIVE_EXCEL_FILES":
          let get_excel_files_uuid = this.getUuid();
          returnArray.push({
            id: get_excel_files_uuid,
            action: action,
            file: null,
          });
          this.addResponder(get_excel_files_uuid, this.getExcelFiles);
          break;
        case "SUBSCRIBE_ACTIVE_EXCEL_FILES":
          let sub_excel_files_uuid = this.getUuid();
          let tempAction: ExcelAction = {
            id: sub_excel_files_uuid,
            action: action,
            file: null,
          };
          returnArray.push(tempAction);
          this.excelActions.push(tempAction);
          break;
        case "GET_EXCEL_CELL_DATA":
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
    let res = await this.RouterClient.query(
      `query-${data.excelFile.fileName}-${data.excelFile.createTimestamp}`,
      {
        action: "GET_RANGE_DATA",
        startCell: data.startCell,
        endCell: data.endCell,
        sheetName: data.sheetName,
      },
      (err: any, res: any) => {}
    );
    return res.response.data;
  };
}

const serviceInstance = new OfficeAddinService();

serviceInstance.start();
