import FpeRouter from '@chartiq/fpe-router';
import * as CONSTANTS from "./../../const";

const finsembleRouter = FpeRouter.router;
console.log("Finsemble Router Ready:", finsembleRouter);

export default class OfficeAddinClient {
  routerClient;
  fileName;
  filePath;
  bookmarkListEventHandler;
  openBookmarkPanelHandler;

  constructor(fileName: string, filePath: string, bookmarkListEventHandler?, openBookmarkPanelHandler?) {
    this.routerClient = finsembleRouter
    this.fileName = fileName
    this.filePath = filePath
    this.openBookmarkPanelHandler = openBookmarkPanelHandler
    this.bookmarkListEventHandler = bookmarkListEventHandler

    let timestamp = new Date().getTime()

    // Tell Finsemble this Excel is opened
    this.routerClient.transmit('finsemble-excel-event', { event: CONSTANTS.EXCEL_ADDIN_LOADED, filePath: filePath, fileName: fileName, timestamp: timestamp })
    this.routerClient.addResponder(`query-${fileName}-${timestamp}`, this.handleExcelQuery.bind(this));

    Excel.run((context) => {
      context.workbook.onSelectionChanged.add(this.handleSelectionChanged.bind(this))
      return context.sync()
    })

    this.getWorksheetList.bind(this)
    this.focusRange.bind(this)
    this.clearRange.bind(this)
    this.getRange.bind(this)
    this.setRange.bind(this)
    this.addExecelOnDataChangeEventHandler.bind(this)
  }

  handleExcelQuery(err, queryMsg) {
    if (!err) {
      switch (queryMsg.data.action) {
        case CONSTANTS.HEALTH_CHECK:
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'DONE', timestamp: new Date().getTime() });
          break;
        case CONSTANTS.GET_WORKSHEET_LIST:
          this.getWorksheetList(queryMsg)
          break;
        case CONSTANTS.FOCUS_EXCEL_RANGE:
          this.focusRange(queryMsg, queryMsg.data.worksheet, queryMsg.data.range)
          break
        case CONSTANTS.CLEAR_EXCEL_RANGE:
          this.clearRange(queryMsg, queryMsg.data.worksheet, queryMsg.data.range)
          break
        case CONSTANTS.GET_EXCEL_RANGE:
          this.getRange(queryMsg, queryMsg.data.worksheet, queryMsg.data.range)
          break
        case CONSTANTS.SET_EXCEL_RANGE:
          this.setRange(queryMsg, queryMsg.data.worksheet, queryMsg.data.range, queryMsg.data.values)
          break
        case CONSTANTS.SET_ACTIVE_WORKSHEET:
          this.setActiveWorksheet(queryMsg, queryMsg.data.worksheet)
          break;
        case CONSTANTS.GET_ACTIVE_WORKSHEET:
          this.getActiveWorksheet(queryMsg)
          break;
        case CONSTANTS.SAVE_EXCEL_WORKBOOK:
          this.saveWorkbook(queryMsg)
          break;
        case CONSTANTS.CREATE_WORKSHEET:
          this.createWorksheet(queryMsg, queryMsg.data.worksheet)
          break;
        case CONSTANTS.DELETE_WORKSHEET:
          this.deleteWorksheet(queryMsg, queryMsg.data.worksheet)
          break;
        case CONSTANTS.HIDE_WORKSHEET:
          this.hideWorksheet(queryMsg, queryMsg.data.worksheet)
          break;
        case CONSTANTS.UNHIDE_WORKSHEET:
          this.unhideWorksheet(queryMsg, queryMsg.data.worksheet)
          break;
        case CONSTANTS.SUBSCRIBE_SHEET_CHANGE:
          this.addExecelOnDataChangeEventHandler(queryMsg)
          break;
        case 'BOOKMARK_LIST':
          this.bookmarkListEventHandler({ bookmarks: queryMsg.data.bookmarks })
          break;
        case 'OPEN_CREATE_BOOKMARK_PANEL':
          this.openBookmarkPanelHandler({ btnLabel: 'Create', pivotSelectedKey: '1' })
          break;
        default:
          queryMsg.sendQueryResponse(null, { field: "No handler for this action" });
          break;
      }
    }
  }

  getWorksheetList(queryMsg) {
    Excel.run((context) => {
      var worksheets = context.workbook.worksheets;
      worksheets.load("items/name");
      return context.sync()
        .then(() => {
          let sheetArray = []
          worksheets.items.forEach((sheet) => {
            sheetArray.push(sheet);
          });
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, worksheetList: sheetArray });
        });
    }).catch(console.log);
  }

  focusRange(queryMsg, targeWorksheet, targetRange) {
    Excel.run((context) => {
      let worksheet;
      if (targeWorksheet) {
        worksheet = context.workbook.worksheets.getItem(targeWorksheet.name);
      } else {
        worksheet = context.workbook.worksheets.getActiveWorksheet();
      }
      worksheet.activate();
      worksheet.load("items/name");
      var range = worksheet.getRange(targetRange);
      range.select();

      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'DONE', range: targetRange, worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }

  clearRange(queryMsg, targeWorksheet, targetRange) {
    Excel.run((context) => {
      let worksheet;
      if (targeWorksheet) {
        worksheet = context.workbook.worksheets.getItem(targeWorksheet.name);
      } else {
        worksheet = context.workbook.worksheets.getActiveWorksheet();
      }
      worksheet.activate();
      worksheet.load("items/name");
      var range = worksheet.getRange(targetRange);
      range.select();
      range.clear();
      context.workbook.save(Excel.SaveBehavior.save);

      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'DONE', range: targetRange, worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }

  getRange(queryMsg, targeWorksheet, targetRange) {
    Excel.run((context) => {
      let worksheet;
      if (targeWorksheet) {
        worksheet = context.workbook.worksheets.getItem(targeWorksheet.name);
      } else {
        worksheet = context.workbook.worksheets.getActiveWorksheet();
      }

      worksheet.activate();
      worksheet.load("items/name");
      var range = worksheet.getRange(targetRange);
      range.select();
      range.load("address, values");

      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'DONE', range: targetRange, values: range.values, worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }

  setRange(queryMsg, targeWorksheet, targetRange, data) {
    Excel.run((context) => {
      let worksheet;
      if (targeWorksheet) {
        worksheet = context.workbook.worksheets.getItem(targeWorksheet.name);
      } else {
        worksheet = context.workbook.worksheets.getActiveWorksheet();
      }
      let range = worksheet.getRange(targetRange);
      range.values = data;
      range.format.autofitColumns();
      range.select();
      context.workbook.save(Excel.SaveBehavior.save);
      worksheet.load("items/name");
      worksheet.activate();
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'DONE', range: targetRange, values: range.values, worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }

  hideWorksheet(queryMsg, targetWorksheet) {
    Excel.run((context) => {
      let worksheet;
      if (targetWorksheet) {
        worksheet = context.workbook.worksheets.getItem(targetWorksheet.name);
      } else {
        worksheet = context.workbook.worksheets.getActiveWorksheet();
      }
      worksheet.visibility = Excel.SheetVisibility.hidden;
      worksheet.load("items/name");
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: "DONE", worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }

  unhideWorksheet(queryMsg, targetWorksheet) {
    Excel.run((context) => {
      let worksheet = context.workbook.worksheets.getItem(targetWorksheet.name);
      worksheet.visibility = Excel.SheetVisibility.visible;
      worksheet.activate();
      worksheet.load("items/name");
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: "DONE", worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }

  createWorksheet(queryMsg, targetWorksheet) {
    Excel.run((context) => {
      var worksheets = context.workbook.worksheets;
      var worksheet = worksheets.add(targetWorksheet.name);
      worksheet.activate();
      worksheet.load("name, position, items");
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: "DONE", worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }

  deleteWorksheet(queryMsg, targetWorksheet) {
    Excel.run((context) => {
      var worksheets = context.workbook.worksheets;
      worksheets.load("items/name");
      let worksheet;
      if (targetWorksheet) {
        worksheet = worksheets.getItem(targetWorksheet.name);
      } else {
        worksheet = worksheets.getActiveWorksheet();
      }
      worksheet.load("items/name");
      return context.sync()
        .then(() => {
          if (worksheets.items.length === 1) {
            queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: "FAILED", worksheets: worksheets, file: this.fileName });
          } else {
            worksheet.delete()
            queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: "DONE", worksheet: worksheet, file: this.fileName });
            return context.sync();
          };
        });
    }).catch(console.log);
  }

  setActiveWorksheet(queryMsg, targeWorksheet) {
    Excel.run((context) => {
      var worksheet = context.workbook.worksheets.getItem(targeWorksheet.name);
      worksheet.activate();
      worksheet.load("items/name");
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'DONE', worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }

  getActiveWorksheet(queryMsg) {
    Excel.run((context) => {
      var worksheet = context.workbook.worksheets.getActiveWorksheet();
      worksheet.load("items/name");
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'DONE', worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }

  saveWorkbook(queryMsg) {
    Excel.run((context) => {
      context.workbook.save(Excel.SaveBehavior.save);
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: `DONE`, file: this.fileName });
        })
    }).catch(console.log);
  }

  addExecelOnDataChangeEventHandler(queryMsg) {
    Excel.run((context) => {
      context.workbook.worksheets.onChanged.add(this.handleSheetChange.bind(this));
      queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: `SUBSCRIBED` });
      return context.sync()
    }).catch(console.log);
  }

  handleSheetChange(event) {
    Excel.run((context) => {
      let worksheet = context.workbook.worksheets.getItem(event.worksheetId);
      worksheet.load("items/name");
      if (event.address.indexOf(':') > 0) {
        var range = worksheet.getRange(event.address);
        range.load("address, values");
      }
      return context.sync()
        .then(() => {
          event.worksheet = worksheet
          if (event.address.indexOf(':') > 0) {
            event.details = { valueAfter: range.values }
          }
          this.routerClient.transmit(`${this.fileName}-event`, { event: 'SHEET_VALUES_CHANGE', eventObj: { range: event.address, details: event.details, worksheet: event.worksheet }, fileName: this.fileName })
        })
    }).catch(console.log);
  }

  handleSelectionChanged = (_event: Excel.SelectionChangedEventArgs) => {
    return Excel.run((context) => {
      var selectedRange = context.workbook.getSelectedRange();
      selectedRange.load("address");
      let worksheet = context.workbook.worksheets.getActiveWorksheet();
      worksheet.load("items/name");
      return context.sync()
        .then(() => {
          this.routerClient.transmit(`${this.fileName}-event`, { event: 'SHEET_SELECTION_CHANGE', eventObj: { range: selectedRange.address.split("!")[1], worksheet: worksheet }, fileName: this.fileName })
        });
    }).catch(console.log);
  }

  openExcelFile = (fileName: string, filePath: string) => {
    this.routerClient.transmit(`${this.fileName}-event`, { event: 'OPEN_EXCEL_FILE', eventObj: { fileName: fileName, filePath: filePath } })
  }

  createBookmark = (bookmark) => {
    this.routerClient.transmit(`${this.fileName}-event`, { event: 'CREATE_BOOKMARK', eventObj: bookmark })
  }

  editBookmark = (bookmark) => {
    this.routerClient.transmit(`${this.fileName}-event`, { event: 'EDIT_BOOKMARK', eventObj: bookmark })
  }

  deleteBookmark = (bookmark) => {
    this.routerClient.transmit(`${this.fileName}-event`, { event: 'DELETE_BOOKMARK', eventObj: bookmark })
  }
}