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

import OfficeAddinClient from "./OfficeAddinClient";



//const editTooltipId = useId('editTooltipId');
//const removeTooltipId = useId('removeTooltipId');
export default class App extends React.Component<AppProps, AppState> {
  officeAddinClient;

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
        this.officeAddinClient = new OfficeAddinClient(fileName, filePath, this.bookmarkListEventHandler.bind(this), this.openBookmarkPanelHandler.bind(this))

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

  bookmarkListEventHandler = (res) => {
    this.setState(res)
  }

  openBookmarkPanelHandler = (res) => {
    this.setState(res)
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
            tempBookmark.range = this.state.range
            tempBookmark.name = this.state.bookmarkName
            tempBookmark.openEndedRange = this.state.openEndedRange
            this.officeAddinClient.editBookmark(tempBookmark)
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
            this.officeAddinClient.createBookmark(bookmark)
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
    this.officeAddinClient.deleteBookmark(bookmark)
  }

  openExcelFile = (fileName: string, filePath: string) => {
    this.officeAddinClient.openExcelFile(fileName, filePath)
  }

  onPivotClicked = (item?: PivotItem) => {
    this.setState({ pivotSelectedKey: item.props.itemKey, btnLabel: 'Create', bookmarkName: this.state.fileName.split('.')[0] + '_', openEndedRange: false, bookmarkToEdit: null })
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
