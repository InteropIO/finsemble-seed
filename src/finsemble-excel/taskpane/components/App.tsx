import * as React from "react";
import { Checkbox, DefaultButton, DetailsList, IColumn, IconButton, Label, Link, SelectionMode, Stack, TooltipHost } from 'office-ui-fabric-react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
//import { useId } from '@uifabric/react-hooks';

import Header from "./Header";
import Progress from "./Progress";
// images references in the manifest
import "./../../assets/finsemble-logo-16.png";
import "./../../assets/finsemble-logo-32.png";
import "./../../assets/finsemble-logo-80.png";
/* global Button, console, Excel, Header, HeroList, HeroListItem, Progress */

import AppState from './../types/AppState';
import AppProps from './../types/AppProps';
import Bookmark from './../types/Bookmark';

import FpeRouter from '@chartiq/fpe-router';
const finsembleRouter = FpeRouter.router;
console.log("Finsemble Router Ready:", finsembleRouter);


//const editTooltipId = useId('editTooltipId');
//const removeTooltipId = useId('removeTooltipId');
export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      fileName: "",
      filePath: "",
      bookmarkName: "",
      range: "",
      openEndedRange: false,
      worksheetList: [],
      worksheet: "",
      bookmarkCol: [
        { key: 'bookmarkName', name: 'Name', fieldName: 'bookmarkName', minWidth: 200, maxWidth: 1000, isResizable: true },
        { key: 'action', name: 'Action', fieldName: 'action', minWidth: 50, maxWidth: 100, isResizable: true },
      ],
      bookmarks: [],
      bookmarkToEdit: null,
      pivotSelectedKey: '0',
      btnLabel: "Create"
    };

    this.createEditBookmarkOnclick = this.createEditBookmarkOnclick.bind(this)
    this.rangeTextOnChanged = this.rangeTextOnChanged.bind(this)
    this.openEndedRangeCheckboxOnChanged = this.openEndedRangeCheckboxOnChanged.bind(this)
    this.bookmarkNameTextOnChanged = this.bookmarkNameTextOnChanged.bind(this)
  }

  stackStyles = {
    root: {
      marginLeft: '5px',
      marginRight: '5px',
    },
  }

  componentDidMount() {
    Office.context.document.getFilePropertiesAsync((asyncResult) => {
      var filePath = asyncResult.value.url;
      var fileName = filePath.replace(/^.*[\\\/]/, '')
      this.setState({
        fileName: fileName,
        filePath: filePath,
        bookmarkName: fileName + '_'
      });

      if (fileName != "") {
        // Tell Finsemble this Excel is opened
        let timestamp = new Date().getTime()
        finsembleRouter.transmit('finsemble-excel-event', { event: 'ADDIN_OPENED', filePath: filePath, fileName: fileName, timestamp: timestamp })
        finsembleRouter.addResponder(`query-${fileName}-${timestamp}`, this.handleExcelQuery);

        // Add selection change event handler
        Excel.run((context) => {
          context.workbook.onSelectionChanged.add(this.handleSelectionChanged)
          context.workbook.worksheets.onAdded.add(this.handleWorksheetsChanged)
          context.workbook.worksheets.onDeleted.add(this.handleWorksheetsChanged)

          var worksheets = context.workbook.worksheets;
          worksheets.load("items/name");

          var selectedRange = context.workbook.getSelectedRange();
          selectedRange.load("address");
          let worksheet = context.workbook.worksheets.getActiveWorksheet();
          worksheet.load("items/name");

          return context.sync().then(() => {
            let tempList: IDropdownOption[] = []
            worksheets.items.forEach((worksheet: Excel.Worksheet) => {
              let tempWorksheetOption: IDropdownOption = {
                key: worksheet.id,
                text: worksheet.name
              }
              tempList.push(tempWorksheetOption)
            })
            this.setState({
              worksheetList: tempList
            })

            this.setState({ worksheet: worksheet.id })
            let range = selectedRange.address.split('!')[1]
            if (this.state.openEndedRange) {
              if (range.indexOf(':') > 0) {
                let newRange = range.substring(0, range.indexOf(':') + 1) + range.substring(range.indexOf(':') + 1, range.length).replace(new RegExp("[0-9]", "g"), "")
                this.setState({ range: newRange })
              } else {
                this.setState({ range: range })
              }
            } else {
              this.setState({ range: range })
            }
          })
        }).catch(console.log);
      }
    });
  }

  handleWorksheetsChanged = (_event: any) => {
    return Excel.run((context) => {
      var worksheets = context.workbook.worksheets;
      worksheets.load("items/name");
      return context.sync()
        .then(() => {
          let tempList: IDropdownOption[] = []
          worksheets.items.forEach((worksheet: Excel.Worksheet) => {
            let tempWorksheetOption: IDropdownOption = {
              key: worksheet.id,
              text: worksheet.name
            }
            tempList.push(tempWorksheetOption)
          })
          this.setState({
            worksheetList: tempList
          })
        });
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
          finsembleRouter.transmit(`${this.state.fileName}-event`, { event: 'SELECTION_CHANGE', eventObj: { address: selectedRange.address, worksheet: worksheet }, fileName: this.state.fileName })

          this.setState({ worksheet: worksheet.id })
          let range = selectedRange.address.split('!')[1]
          if (this.state.openEndedRange) {
            if (range.indexOf(':') > 0) {
              let newRange = range.substring(0, range.indexOf(':') + 1) + range.substring(range.indexOf(':') + 1, range.length).replace(new RegExp("[0-9]", "g"), "")
              this.setState({ range: newRange })
            } else {
              this.setState({ range: range })
            }
          } else {
            this.setState({ range: range })
          }
        });
    }).catch(console.log);
  }

  handleSheetChange = (event) => {
    return Excel.run((context) => {
      let worksheet = context.workbook.worksheets.getItem(event.worksheetId);
      worksheet.load("items/name");
      return context.sync().then(() => {
        event.worksheet = worksheet
        finsembleRouter.transmit(`${this.state.fileName}-event`, { event: 'SHEET_CHANGE', eventObj: event, fileName: this.state.fileName })
      })
    }).catch(console.log);
  }

  handleExcelQuery = (err, queryMsg) => {
    if (!err) {
      switch (queryMsg.data.action) {
        case 'HEALTH_CHECK':
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'DONE', timestamp: new Date().getTime() });
          break;
        case 'GET_CELL_DATA':
          this.getCellData(queryMsg, queryMsg.data.row, queryMsg.data.col, queryMsg.data.worksheetName)
          break;
        case 'GET_RANGE_DATA':
          this.getRangeData(queryMsg, queryMsg.data.startCell, queryMsg.data.endCell, queryMsg.data.worksheetName)
          break
        case 'SET_RANGE_DATA':
          this.setRangeData(queryMsg, queryMsg.data.startCell, queryMsg.data.endCell, queryMsg.data.values, queryMsg.data.worksheetName)
          break;
        case 'CREATE_WORKSHEET':
          this.createWorksheet(queryMsg, queryMsg.data.worksheetName)
          break;
        case 'CREATE_WORKBOOK':
          this.createWorkbook(queryMsg)
          break;
        case 'SAVE_EXCEL_WORKBOOK':
          this.saveWorkbook(queryMsg)
          break;
        case 'CLOSE_WORKBOOK':
          this.closeWorkbook(queryMsg)
          break;
        case 'SUBSCRIBE_SHEET_CHANGE':
          this.addExecelOnDataChangeEventHandler(queryMsg)
          break;
        case 'GET_WORKSHEET_LIST':
          this.getWorksheetList(queryMsg)
          break;
        case 'SET_ACTIVE_WORKSHEET':
          this.setActiveWorksheet(queryMsg, queryMsg.data.worksheetName)
          break;
        case 'PASTE_TO_EXCEL':
          this.pasteToExcel(queryMsg, queryMsg.data.worksheet, queryMsg.data.range, queryMsg.data.data)
          break;
        case 'FOCUS_RANGE':
          this.focusRange(queryMsg, queryMsg.data.worksheet, queryMsg.data.range)
          break
        case 'CLEAR_RANGE':
          this.clearRange(queryMsg, queryMsg.data.worksheet, queryMsg.data.range)
          break
        case 'COPY_RANGE':
          this.copyRange(queryMsg, queryMsg.data.worksheet, queryMsg.data.range)
          break
        case 'SEND_BOOKMARKS':
          this.setState({ bookmarks: queryMsg.data.bookmarks })
          break;
        case 'OPEN_CREATE_BOOKMARK_PANEL':
          this.setState({ btnLabel: 'Create', pivotSelectedKey: '1' })
          break;
        default:
          queryMsg.sendQueryResponse(null, { field1: "handleExcelQueryResponse" });
          break;
      }
    }
  }


  setRangeData = async (queryMsg, startCell, endCell, values, worksheetName) => {
    Excel.run(function (context) {
      let sheet;
      if (worksheetName) {
        sheet = context.workbook.worksheets.getItem(worksheetName);
      } else {
        sheet = context.workbook.worksheets.getActiveWorksheet();
      }

      var range = sheet.getRange(`${startCell}:${endCell}`);
      range.values = values;
      range.format.autofitColumns();

      return context.sync().then(() => {
        queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'done' });
      });
    }).catch(console.log);
  }


  getCellData = async (queryMsg, row: number, col: number, worksheetName: string) => {
    await Excel.run((context) => {
      let sheet;
      if (worksheetName) {
        sheet = context.workbook.worksheets.getItem(worksheetName);
      } else {
        sheet = context.workbook.worksheets.getActiveWorksheet();
      }

      let cell = sheet.getCell(row, col);
      cell.load("address, values");
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { fileName: this.state.fileName, row: row, col: col, action: queryMsg.data.action, address: cell.address, values: cell.values[0][0] });
        })
    }).catch(console.log);
  }

  getRangeData = async (queryMsg, startCell: string, endCell: string, worksheetName: string) => {
    await Excel.run((context) => {
      let sheet;
      if (worksheetName) {
        sheet = context.workbook.worksheets.getItem(worksheetName);
      } else {
        sheet = context.workbook.worksheets.getActiveWorksheet();
      }

      let range = sheet.getRange(startCell + ":" + endCell);
      range.load("address, values");
      return context.sync()
        .then(() => {

          queryMsg.sendQueryResponse(null, { fileName: this.state.fileName, worksheetName: worksheetName, action: queryMsg.data.action, address: range.address, values: range.values });
        })
    }).catch(console.log);
  }

  createWorksheet = async (queryMsg, worksheetName: string) => {
    Excel.run((context) => {
      var sheets = context.workbook.worksheets;
      var sheet = sheets.add(worksheetName);
      sheet.activate();
      sheet.load("name, position");
      return context.sync()
        .then(function () {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: `Added worksheet named "${sheet.name}" in position ${sheet.position}` });
        });
    }).catch(console.log);
  }

  createWorkbook = async (queryMsg) => {
    Excel.createWorkbook();
    queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: `CREATED` });
  }

  saveWorkbook = async (queryMsg) => {
    Excel.run((context) => {
      context.workbook.save(Excel.SaveBehavior.save);
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: `SAVED`, file: this.state.fileName });
        })
    }).catch(console.log);
  }

  closeWorkbook = async (queryMsg) => {
    Excel.run((context) => {
      context.workbook.close(Excel.CloseBehavior.save);
      queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: `CLOSED` });
      return context.sync()
    }).catch(console.log);
  }

  addExecelOnDataChangeEventHandler = async (queryMsg) => {
    await Excel.run((context) => {
      // let worksheet;
      // if (queryMsg.worksheet) {
      //   worksheet = context.workbook.worksheets.getItem(queryMsg.worksheet.name);
      // } else {
      //   worksheet = context.workbook.worksheets.getActiveWorksheet();
      // }
      context.workbook.worksheets.onChanged.add(this.handleSheetChange);
      queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: `SUBSCRIBED` });
      return context.sync()
    }).catch(console.log);
  }

  getWorksheetList = async (queryMsg) => {
    Excel.run((context) => {
      var sheets = context.workbook.worksheets;
      sheets.load("items/name");

      return context.sync()
        .then(() => {
          let sheetArray = []
          sheets.items.forEach(function (sheet) {
            sheetArray.push(sheet);
          });
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, worksheetList: sheetArray });
        });
    }).catch(console.log);
  }

  setActiveWorksheet = async (queryMsg, worksheetName) => {
    Excel.run(function (context) {
      var sheet = context.workbook.worksheets.getItem(worksheetName);
      sheet.activate();
      sheet.load("name");

      return context.sync()
        .then(function () {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'done' });
        });
    }).catch(console.log);
  }

  pasteToExcel = async (queryMsg, worksheet, range, data) => {
    await Excel.run((context) => {
      let targetWorksheet = context.workbook.worksheets.getItem(worksheet.name);
      let targetRange = targetWorksheet.getRange(range);
      targetRange.values = data;
      targetRange.format.autofitColumns();
      targetRange.select();
      context.workbook.save(Excel.SaveBehavior.save);
      targetWorksheet.load("name");
      targetWorksheet.activate();
      return context.sync()
        .then(() => {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'done' });
        });
    }).catch(console.log);
  }

  focusRange = async (queryMsg, targeWorksheet, targetRange) => {
    Excel.run(function (context) {
      var sheet = context.workbook.worksheets.getItem(targeWorksheet.name);
      sheet.activate();
      sheet.load("name");
      var range = sheet.getRange(targetRange);
      range.select();

      return context.sync()
        .then(function () {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'done' });
        });
    }).catch(console.log);
  }

  clearRange = async (queryMsg, targeWorksheet, targetRange) => {
    Excel.run(function (context) {
      var sheet = context.workbook.worksheets.getItem(targeWorksheet.name);
      sheet.activate();
      sheet.load("name");
      var range = sheet.getRange(targetRange);
      range.select();
      range.clear();
      context.workbook.save(Excel.SaveBehavior.save);

      return context.sync()
        .then(function () {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: 'done' });
        });
    }).catch(console.log);
  }

  copyRange = async (queryMsg, targeWorksheet, targetRange) => {
    Excel.run(function (context) {
      var sheet = context.workbook.worksheets.getItem(targeWorksheet.name);
      sheet.activate();
      sheet.load("name");
      var range = sheet.getRange(targetRange);
      range.select();
      range.load("address, values");

      return context.sync()
        .then(function () {
          queryMsg.sendQueryResponse(null, { action: queryMsg.data.action, result: { range: range.address, data: range.values } });
        });
    }).catch(console.log);
  }



  rangeTextOnChanged = (_e, newText) => {
    this.setState({ range: newText });
  }

  openEndedRangeCheckboxOnChanged = (_e, isChecked) => {
    this.setState({ openEndedRange: isChecked })
    Excel.run((context) => {
      var selectedRange = context.workbook.getSelectedRange();
      selectedRange.load("address");
      return context.sync()
        .then(() => {
          let range = selectedRange.address.split('!')[1]
          if (isChecked) {
            if (range.indexOf(':') > 0) {
              let newRange = range.substring(0, range.indexOf(':') + 1) + range.substring(range.indexOf(':') + 1, range.length).replace(new RegExp("[0-9]", "g"), "")
              this.setState({ range: newRange })
            }
          } else {
            this.setState({ range: range })
          }
        });
    }).catch(console.log);
  }

  bookmarkNameTextOnChanged = (_e, newText) => {
    this.setState({ bookmarkName: newText })
  }

  targetWorksheetDropdownOnchange = (_e, item) => {
    this.setState({ worksheet: item.key.toString() });
  }

  createEditBookmarkOnclick = () => {
    Excel.run((context) => {
      let worksheet = context.workbook.worksheets.getItem(this.state.worksheet);
      worksheet.load("items/name");
      return context.sync()
        .then(() => {
          if (this.state.bookmarkToEdit) {
            //edit bookmark
            let tempBookmark = this.state.bookmarkToEdit
            tempBookmark.worksheet = worksheet
            tempBookmark.range = this.state.range,
              tempBookmark.name = this.state.bookmarkName
            tempBookmark.openEndedRange = this.state.openEndedRange
            finsembleRouter.transmit(`${this.state.fileName}-event`, { event: 'EDIT_BOOKMARK', eventObj: tempBookmark })
          } else {
            //create bookmark
            let bookmark = {
              worksheet: worksheet,
              range: this.state.range,
              openEndedRange: this.state.openEndedRange,
              name: this.state.bookmarkName,
              excelFileName: this.state.fileName,
              excelFilePath: this.state.filePath
            }
            finsembleRouter.transmit(`${this.state.fileName}-event`, { event: 'CREATE_BOOKMARK', eventObj: bookmark })
          }
          this.setState({ btnLabel: 'Create', pivotSelectedKey: '0', bookmarkName: "", openEndedRange: false })
        })
    }).catch(console.log);
  }

  editBookmarkOnclick = (bookmark: Bookmark) => {
    this.setState({ bookmarkToEdit: bookmark, btnLabel: 'Edit', pivotSelectedKey: '1', bookmarkName: bookmark.name, range: bookmark.range, worksheet: bookmark.worksheet.id, openEndedRange: bookmark.openEndedRange })
  }

  deleteBookmarkOnclick = (bookmark: Bookmark) => {
    let filteredBookmarks = this.state.bookmarks.filter((tempBookmark: Bookmark) => { return tempBookmark.name !== bookmark.name })
    this.setState({ bookmarks: filteredBookmarks })
    finsembleRouter.transmit(`${this.state.fileName}-event`, { event: 'DELETE_BOOKMARK', eventObj: bookmark })
  }

  renderItemColumn = (bookmark: Bookmark, _index: number, column: IColumn) => {
    switch (column.key) {
      case 'bookmarkName':
        return <div style={{ height: '30px' }}>

          <div>{bookmark.name}</div>
          <TooltipHost
            content={bookmark.excelFile.filePath}
            id={bookmark.id}
          >
            <div>{bookmark.excelFile.fileName == this.state.fileName ? '' : <Link onClick={() => { this.openExcelFile(bookmark.excelFile.fileName, bookmark.excelFile.filePath) }}>{bookmark.excelFile.fileName}</Link>}</div>
          </TooltipHost>
        </div>;
      case 'action':
        return <div style={{ height: '30px' }}>
          <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" ariaLabel="Edit" onClick={() => { this.editBookmarkOnclick(bookmark) }} />
          <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" ariaLabel="Delete" onClick={() => { this.deleteBookmarkOnclick(bookmark) }} />
        </div>;
      default:
        return <span></span>;
    }
  }

  openExcelFile = (fileName: string, filePath: string) => {
    finsembleRouter.transmit(`${this.state.fileName}-event`, { event: 'OPEN_EXCEL_FILE', eventObj: { fileName: fileName, filePath: filePath } })
  }

  onPivotClicked = (item?: PivotItem) => {
    this.setState({ pivotSelectedKey: item.props.itemKey, btnLabel: 'Create', bookmarkName: this.state.fileName.split('.')[0] + '_', openEndedRange: false, bookmarkToEdit: null })
  }


  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress title={title} logo="assets/Finsemble_Logo_Dark.svg" message="Please sideload your addin to see app body." />
      );
    }

    return (
      <div>
        <Header logo="assets/Finsemble_Logo_Dark.svg" title={this.props.title} message="Finsemble-Excel" />
        <Pivot aria-label="Pivot" selectedKey={this.state.pivotSelectedKey} onLinkClick={this.onPivotClicked}>
          <PivotItem headerText="Bookmark List" itemKey="0" >
            <Stack horizontal tokens={{ childrenGap: 30 }} verticalAlign="end">
              <DetailsList
                compact={true}
                items={this.state.bookmarks}
                columns={this.state.bookmarkCol}
                selectionMode={SelectionMode.none}
                onRenderItemColumn={this.renderItemColumn}
                isHeaderVisible={false}
                styles={{ root: { width: '98vw' } }}
              />
            </Stack>
          </PivotItem>
          <PivotItem headerText="Bookmark" itemKey="1" >
            <Stack tokens={{ childrenGap: 10 }} verticalAlign="end" styles={this.stackStyles}>
              <Stack horizontal tokens={{ childrenGap: 30 }} verticalAlign="end">
                <Label>Excel File: {this.state.bookmarkToEdit ? this.state.bookmarkToEdit.excelFile.fileName : this.state.fileName}</Label>
              </Stack>
              <Stack horizontal tokens={{ childrenGap: 30 }} verticalAlign="end">
                <TextField autoFocus label="Name" placeholder="Input your bookmark name" value={this.state.bookmarkName} onChange={this.bookmarkNameTextOnChanged} styles={{ root: { width: '100%' } }} />
              </Stack>

              <Stack horizontal tokens={{ childrenGap: 30 }} verticalAlign="end">
                <TextField label="Range" value={this.state.range} onChange={this.rangeTextOnChanged} styles={{ root: { width: '40%' } }} />
                <Checkbox label="Open ended range" checked={this.state.openEndedRange} onChange={this.openEndedRangeCheckboxOnChanged} styles={{ root: { width: '60%' } }} />
              </Stack>

              <Stack horizontal tokens={{ childrenGap: 30 }} verticalAlign="end">
                <Dropdown
                  placeholder="Select a worksheet"
                  label="Worksheet"
                  options={this.state.worksheetList}
                  onChange={this.targetWorksheetDropdownOnchange}
                  selectedKey={this.state.worksheet}
                  styles={{
                    root: { width: '100%' },
                  }}
                />
              </Stack>
              <Stack horizontal tokens={{ childrenGap: 30 }} horizontalAlign="end">
                <DefaultButton text={this.state.btnLabel} onClick={this.createEditBookmarkOnclick} />
              </Stack>
            </Stack>
          </PivotItem>
        </Pivot>
      </div>
    );
  }
}
