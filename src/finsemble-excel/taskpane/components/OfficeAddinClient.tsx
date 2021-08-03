import FpeRouter from '@chartiq/fpe-router';
import ExcelWorksheet from '../../../services/OfficeAddin/types/ExcelWorksheet';

import * as CONSTANTS from "./../../const";

const finsembleRouter = FpeRouter.router;
console.log("Finsemble Router Ready:", finsembleRouter);

export default class OfficeAddinClient {
  routerClient: any;
  fileName: string;
  filePath: string;
  bookmarkListEventHandler: any;
  openBookmarkPanelHandler: any;

  constructor(fileName: string, filePath: string, bookmarkListEventHandler?: any, openBookmarkPanelHandler?: any) {
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
      context.workbook.worksheets.onChanged.add(this.handleSheetChange.bind(this));
      return context.sync()
    })

    this.getWorksheetList.bind(this)
    this.focusRange.bind(this)
    this.clearRange.bind(this)
    this.getRange.bind(this)
    this.setRange.bind(this)
  }

  handleExcelQuery(err: any, queryMsg: any) {
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

  getWorksheetList(queryMsg: any) {
    Excel.run((context) => {
      var worksheets = context.workbook.worksheets;
      worksheets.load("items/name");
      return context.sync()
        .then(() => {
          let sheetArray = Array<Excel.Worksheet>();
          worksheets.items.forEach((sheet) => {
            sheetArray.push(sheet);
          });
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, worksheetList: sheetArray });
        });
    }).catch(console.log);
  }

  focusRange(queryMsg: any, targeWorksheet: ExcelWorksheet, targetRange: string) {
    Excel.run((context) => {
      let worksheet: Excel.Worksheet;
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

  clearRange(queryMsg: any, targeWorksheet: ExcelWorksheet, targetRange: string) {
    Excel.run((context) => {
      let worksheet: Excel.Worksheet;
      if (targeWorksheet) {
        worksheet = context.workbook.worksheets.getItem(targeWorksheet.name);
      } else {
        worksheet = context.workbook.worksheets.getActiveWorksheet();
      }
      worksheet.activate();
      worksheet.load("items/name");
      var range: Excel.Range = worksheet.getRange(targetRange);
      range.select();
      range.clear();
      context.workbook.save(Excel.SaveBehavior.save);

      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'DONE', range: targetRange, worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }


  getRange(queryMsg: any, targetWorksheet: ExcelWorksheet, targetRange: string) {
    Excel.run((context) => {
      let worksheet: Excel.Worksheet;
      if (targetWorksheet) {
        worksheet = context.workbook.worksheets.getItem(targetWorksheet.name);
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

  setRange(queryMsg: any, targetWorksheet: ExcelWorksheet, targetRange: string, data: Array<Array<string>>) {
    Excel.run((context) => {
      let worksheet: Excel.Worksheet;
      if (targetWorksheet) {
        worksheet = context.workbook.worksheets.getItem(targetWorksheet.name);
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

  hideWorksheet(queryMsg: any, targetWorksheet: ExcelWorksheet) {
    Excel.run((context: any) => {
      let worksheet: Excel.Worksheet;
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

  unhideWorksheet(queryMsg: any, targetWorksheet: ExcelWorksheet) {
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

  createWorksheet(queryMsg: any, targetWorksheet: ExcelWorksheet) {
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

  deleteWorksheet(queryMsg: any, targetWorksheet?: ExcelWorksheet) {
    Excel.run((context) => {
      var worksheets = context.workbook.worksheets;
      worksheets.load("items/name");
      let worksheet: Excel.Worksheet;
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
          };
        });
    }).catch(console.log);
  }

  setActiveWorksheet(queryMsg: any, targetWorksheet: ExcelWorksheet) {
    Excel.run((context) => {
      var worksheet = context.workbook.worksheets.getItem(targetWorksheet.name);
      worksheet.activate();
      worksheet.load("items/name");
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'DONE', worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }

  getActiveWorksheet(queryMsg: any) {
    Excel.run((context) => {
      var worksheet = context.workbook.worksheets.getActiveWorksheet();
      worksheet.load("items/name");
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'DONE', worksheet: worksheet, file: this.fileName });
        });
    }).catch(console.log);
  }

  saveWorkbook(queryMsg: any) {
    Excel.run((context) => {
      context.workbook.save(Excel.SaveBehavior.save);
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: `DONE`, file: this.fileName });
        })
    }).catch(console.log);
  }

  handleSheetChange(event: Excel.WorksheetChangedEventArgs) {
    Excel.run((context) => {
      let worksheet = context.workbook.worksheets.getItem(event.worksheetId);
      worksheet.load("items/name");
      if (event.address.indexOf(':') > 0) {
        var range = worksheet.getRange(event.address);
        range.load("address, values");
      }
      return context.sync()
        .then(() => {
          if (event.address.indexOf(':') > 0) {
            event.details = { valueTypeAfter: 'Unknown', valueTypeBefore: 'Unknown', valueBefore: {}, valueAfter: range.values }
          }
          this.routerClient.transmit(`${this.fileName}-event`, { event: 'SHEET_VALUES_CHANGE', eventObj: { range: event.address, details: event.details, worksheet: worksheet }, fileName: this.fileName })
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

  createBookmark = (bookmark: any) => {
    this.routerClient.transmit(`${this.fileName}-event`, { event: 'CREATE_BOOKMARK', eventObj: bookmark })
  }

  editBookmark = (bookmark: any) => {
    this.routerClient.transmit(`${this.fileName}-event`, { event: 'EDIT_BOOKMARK', eventObj: bookmark })
  }

  deleteBookmark = (bookmark: any) => {
    this.routerClient.transmit(`${this.fileName}-event`, { event: 'DELETE_BOOKMARK', eventObj: bookmark })
  }
}