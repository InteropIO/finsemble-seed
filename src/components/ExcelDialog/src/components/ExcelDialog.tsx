import * as React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { registerActionThunk, setSelectedActiveExcelFile, setSelectedClipboardData, setSelectedPreviousExcelFiles, setRange, pasteToExcel, focusRange, clearRange, copyRange, setSelectedWorksheet } from "../redux/actions/actions";

import ActiveExcelFileList from "./ActiveExcelFileList";
import PreviousExcelFileList from "./PreviousExcelFileList";
import BookmarkList from "./BookmarkList"
import Range from "./Range";
import TargetWorksheetList from "./TargetWorksheetList";
import * as CONSTANTS from "../redux/actions/actionTypes";
import Worksheet from "../../../../services/OfficeAddin/types/Worksheet";
import ExcelAction from "../../../../services/OfficeAddin/types/ExcelAction";
import ExcelFile from "../../../../services/OfficeAddin/types/ExcelFile";


const ExcelDialog = (props: any) => {
    const { selectedActiveExcelFile, setSelectedActiveExcelFile } = props;
    const { selectedPreviousExcelFiles, clearSelectedPreviousExcelFiles } = props;
    const { clipboardData, setSelectedClipboardData } = props
    const { pasteToExcel } = props
    const { selectedWorksheet, range } = props
    const { offAddInServiceActions } = props;
    const { registerPasteToExcel, registerFocusRange, registerCopyRange, registerClearRange, registerBroadcastData, resgisterChangeSubscription } = props;
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
            setSelectedWorksheet(selectedBookmark.worksheet)
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
                pasteToExcel(tempCopyToExcelAction.id, selectedActiveExcelFile, selectedWorksheet, range, clipboardData)
            })
        } else {
            registerPasteToExcel([selectedActiveExcelFile], { excelFile: selectedActiveExcelFile, worksheet: selectedWorksheet, range: range, data: clipboardData })
        }
    }

    const focusRangeOnclick = () => {
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.FOCUS_RANGE && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                focusRange(tempCopyToExcelAction.id, selectedActiveExcelFile, selectedWorksheet, range)
            })
        } else {
            registerFocusRange([selectedActiveExcelFile], { excelFile: selectedActiveExcelFile, worksheet: selectedWorksheet, range: range })
        }
    }

    const copyRangeOnclick = () => {
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.COPY_RANGE && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                copyRange(tempCopyToExcelAction.id, selectedActiveExcelFile, selectedWorksheet, range)
            })
        } else {
            registerCopyRange([selectedActiveExcelFile], { excelFile: selectedActiveExcelFile, worksheet: selectedWorksheet, range: range })
        }
    }

    const clearRangeOnclick = () => {
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.CLEAR_RANGE && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                clearRange(tempCopyToExcelAction.id, selectedActiveExcelFile, selectedWorksheet, range)
            })
        } else {
            registerClearRange([selectedActiveExcelFile], { excelFile: selectedActiveExcelFile, worksheet: selectedWorksheet, range: range })
        }
    }

    const subscribeOnClick = () => {
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.CHANGE_SUBSCRIPTION && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName && offAddInServiceAction?.bookmark?.name === selectedBookmark.name
        })
        if (tempCopyToExcelActions.length == 0) {
            if (range != '')
                resgisterChangeSubscription([selectedActiveExcelFile], { bookmark: selectedBookmark })
            else
                resgisterChangeSubscription([selectedActiveExcelFile], {})

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
                <button onClick={subscribeOnClick}>Subscribe</button>
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
        selectedWorksheet: excelFilesReducer.selectedWorksheet,
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
        resgisterChangeSubscription: (excelFiles: Array<ExcelFile>, params: {}) => dispatch(registerActionThunk(CONSTANTS.CHANGE_SUBSCRIPTION, excelFiles, params)),
        registerBroadcastData: () => dispatch(registerActionThunk(CONSTANTS.BROADCAST_DATA)),
        clearSelectedPreviousExcelFiles: () => dispatch(setSelectedPreviousExcelFiles([])),
        clearSelectedActiveExcelFiles: () => dispatch(setSelectedActiveExcelFile(null)),
        setSelectedClipboardData: (clipboardData: []) => dispatch(setSelectedClipboardData(clipboardData)),
        setSelectedActiveExcelFile: (selectedActiveFile: ExcelFile) => dispatch(setSelectedActiveExcelFile(selectedActiveFile)),
        setSelectedWorksheet: (selectedWorksheet: Worksheet) => dispatch(setSelectedWorksheet(selectedWorksheet)),
        setRange: (range: string) => dispatch(setRange(range)),
        pasteToExcel: (actionId: string, excelFile: ExcelFile, targeWorksheet: Worksheet, range: string, data: []) => dispatch(pasteToExcel(actionId, excelFile, targeWorksheet, range, data)),
        focusRange: (actionId: string, excelFile: ExcelFile, targeWorksheet: Worksheet, range: string) => dispatch(focusRange(actionId, excelFile, targeWorksheet, range)),
        copyRange: (actionId: string, excelFile: ExcelFile, targeWorksheet: Worksheet, range: string) => dispatch(copyRange(actionId, excelFile, targeWorksheet, range)),
        clearRange: (actionId: string, excelFile: ExcelFile, targeWorksheet: Worksheet, range: string) => dispatch(clearRange(actionId, excelFile, targeWorksheet, range)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExcelDialog);