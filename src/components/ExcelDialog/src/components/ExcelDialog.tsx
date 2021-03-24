import * as React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { getWorksheetList, registerActionThunk, setSelectedActiveExcelFile, setSelectedClipboardData, setSelectedPreviousExcelFiles, setRange, setTargetWorksheet, pasteToExcel, focusRange, clearRange, copyRange } from "../redux/actions/actions";
import ExcelFile from "../types/ExcelFile";

import ActiveExcelFileList from "./ActiveExcelFileList";
import PreviousExcelFileList from "./PreviousExcelFileList";
import BookmarkList from "./BookmarkList"
import Range from "./Range";
import TargetWorksheetList from "./TargetWorksheetList";
import * as CONSTANTS from "../redux/actions/actionTypes";
import { ExcelAction } from "../../../ExcelTester/src/types/types";
import { Worksheet } from "../types/types";


const ExcelDialog = (props: any) => {
    const { selectedActiveExcelFile, setSelectedActiveExcelFile } = props;
    const { selectedPreviousExcelFiles, clearSelectedPreviousExcelFiles } = props;
    const { clipboardData, setSelectedClipboardData } = props
    const { pasteToExcel } = props
    const { targetWorksheet, range } = props
    const { offAddInServiceActions } = props;
    const { registerPasteToExcel, registerFocusRange, registerCopyRange, registerClearRange, registerBroadcastData } = props;
    const { selectedBookmark, setSelectedWorksheet } = props
    const { setRange } = props;
    const { activeExcelFiles } = props
    const { focusRange, copyRange, clearRange } = props

    const spawnExcelFileOnclick = () => {
        if (selectedPreviousExcelFiles.length > 0) {
            selectedPreviousExcelFiles.forEach((selectedPreviousFile: ExcelFile) => {
                FSBL.Clients.LauncherClient.spawn('Excel', { arguments: `${selectedPreviousFile.filePath} /x /a FinsembleExcel` });
            })
            clearSelectedPreviousExcelFiles()
        } else {
            alert('Please select at least 1 file!')
        }
    }

    useEffect(() => {
        registerBroadcastData()
    }, [])

    const loadBookmarkOnclick = () => {
        let excelFile = activeExcelFiles.filter((file: ExcelFile) => {
            return file.fileName === selectedBookmark.excelFile.fileName
        })
        if (excelFile.length > 0) {
            setSelectedActiveExcelFile(excelFile[0])
            setSelectedWorksheet(selectedBookmark.targetWorksheet)
            setRange(selectedBookmark.range)
        }
    }

    const pasteToExceOnClick = () => {
        // Need to implement to check logic
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.PASTE_TO_EXCEL && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                pasteToExcel(tempCopyToExcelAction.id, selectedActiveExcelFile, targetWorksheet, range, clipboardData)
            })
        } else {
            registerPasteToExcel([selectedActiveExcelFile], { targetExcelFile: selectedActiveExcelFile, targetWorksheet: targetWorksheet, range: range, data: clipboardData })
        }
    }

    const focusRangeOnclick = () => {
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.FOCUS_RANGE && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                focusRange(tempCopyToExcelAction.id, selectedActiveExcelFile, targetWorksheet, range)
            })
        } else {
            registerFocusRange([selectedActiveExcelFile], { targetExcelFile: selectedActiveExcelFile, targetWorksheet: targetWorksheet, range: range })
        }
    }

    const copyRangeOnclick = () => {
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.COPY_RANGE && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                copyRange(tempCopyToExcelAction.id, selectedActiveExcelFile, targetWorksheet, range)
            })
        } else {
            registerCopyRange([selectedActiveExcelFile], { targetExcelFile: selectedActiveExcelFile, targetWorksheet: targetWorksheet, range: range })
        }
    }

    const clearRangeOnclick = () => {
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.CLEAR_RANGE && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                clearRange(tempCopyToExcelAction.id, selectedActiveExcelFile, targetWorksheet, range)
            })
        } else {
            registerClearRange([selectedActiveExcelFile], { targetExcelFile: selectedActiveExcelFile, targetWorksheet: targetWorksheet, range: range })
        }
    }

    return (
        <div id='ExcelDialog'>
            <textarea id='dummyClipboardDataTextArea' value={JSON.stringify(clipboardData, null, "\t")} onChange={(e) => { setSelectedClipboardData(JSON.parse(e.target.value)) }}></textarea>
            <br /><br />

            <div>
                <PreviousExcelFileList />
                <button onClick={spawnExcelFileOnclick}>Spawn</button>
            </div>

            <div>
                <BookmarkList />
                <button onClick={loadBookmarkOnclick}>Load</button>
                <br /><br />
            </div>

            <div>
                <ActiveExcelFileList />
                <br /><br /><br />
            </div>

            <div>
                <TargetWorksheetList />
                <Range />

                <br />
            </div>

            <div>
                <button onClick={focusRangeOnclick}>Focus</button>
                <button onClick={copyRangeOnclick}>Copy</button>
                <button onClick={clearRangeOnclick}>Clear</button>
                <button onClick={pasteToExceOnClick}>Paste</button>

            </div>
        </div>
    );
};

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        offAddInServiceActions: officeAddinServiceActionsReducer.offAddInServiceActions,
        selectedActiveExcelFile: excelFilesReducer.selectedActiveExcelFile,
        selectedPreviousExcelFiles: excelFilesReducer.selectedPreviousExcelFiles,
        clipboardData: excelFilesReducer.selectedClipboardData,
        targetWorksheet: excelFilesReducer.targetWorksheet,
        range: excelFilesReducer.range,
        selectedBookmark: excelFilesReducer.selectedBookmark,
        activeExcelFiles: excelFilesReducer.activeExcelFiles,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        registerPasteToExcel: (excelFiles: Array<ExcelFile>, params: {}) => dispatch(registerActionThunk(CONSTANTS.PASTE_TO_EXCEL, excelFiles, params)),
        registerFocusRange: (excelFiles: Array<ExcelFile>, params: {}) => dispatch(registerActionThunk(CONSTANTS.FOCUS_RANGE, excelFiles, params)),
        registerCopyRange: (excelFiles: Array<ExcelFile>, params: {}) => dispatch(registerActionThunk(CONSTANTS.COPY_RANGE, excelFiles, params)),
        registerClearRange: (excelFiles: Array<ExcelFile>, params: {}) => dispatch(registerActionThunk(CONSTANTS.CLEAR_RANGE, excelFiles, params)),
        registerBroadcastData: () => dispatch(registerActionThunk(CONSTANTS.BROADCAST_DATA)),
        clearSelectedPreviousExcelFiles: () => dispatch(setSelectedPreviousExcelFiles([])),
        clearSelectedActiveExcelFiles: () => dispatch(setSelectedActiveExcelFile(null)),
        setSelectedClipboardData: (clipboardData: []) => dispatch(setSelectedClipboardData(clipboardData)),
        setSelectedActiveExcelFile: (selectedActiveFile: ExcelFile) => dispatch(setSelectedActiveExcelFile(selectedActiveFile)),
        setSelectedWorksheet: (selectedWorksheet: Worksheet) => dispatch(setTargetWorksheet(selectedWorksheet)),
        setRange: (range: string) => dispatch(setRange(range)),
        pasteToExcel: (actionId: string, targetExcelFile: ExcelFile, targeWorksheet: Worksheet, range: string, data: []) => dispatch(pasteToExcel(actionId, targetExcelFile, targeWorksheet, range, data)),
        focusRange: (actionId: string, targetExcelFile: ExcelFile, targeWorksheet: Worksheet, range: string) => dispatch(focusRange(actionId, targetExcelFile, targeWorksheet, range)),
        copyRange: (actionId: string, targetExcelFile: ExcelFile, targeWorksheet: Worksheet, range: string) => dispatch(copyRange(actionId, targetExcelFile, targeWorksheet, range)),
        clearRange: (actionId: string, targetExcelFile: ExcelFile, targeWorksheet: Worksheet, range: string) => dispatch(clearRange(actionId, targetExcelFile, targeWorksheet, range)),

    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExcelDialog);