import * as React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { getWorksheetList, registerActionThunk, setSelectedActiveExcelFile, setSelectedClipboardData, setSelectedPreviousExcelFiles, setRange, setTargetWorksheet, setOpenWorksheet, pasteToExcel } from "../redux/actions/actions";
import ExcelFile from "../types/ExcelFile";

import ActiveExcelFileList from "./ActiveExcelFileList";
import PreviousExcelFileList from "./PreviousExcelFileList";
import BookmarkList from "./BookmarkList"
import Range from "./Range";
import OpenWorksheetList from "./OpenWorksheetList";
import TargetWorksheetList from "./TargetWorksheetList";
import * as CONSTANTS from "../redux/actions/actionTypes";
import { ExcelAction } from "../../../ExcelTester/src/types/types";
import { Worksheet } from "../types/types";


const ExcelDialog = (props: any) => {
    const { selectedActiveExcelFile, setSelectedActiveExcelFile } = props;
    const { selectedPreviousExcelFiles, clearSelectedPreviousExcelFiles } = props;
    const { clipboardData, setSelectedClipboardData } = props
    const { pasteToExcel } = props
    const { targetWorksheet, range, openWorksheet } = props
    const { offAddInServiceActions } = props;
    const { registerPasteToExcel } = props;
    const { selectedBookmark, setSelectedWorksheet } = props
    const { setRange } = props;
    const { setOpenWorksheet } = props
    const { activeExcelFiles } = props

    const spawnExcelFile = () => {
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
        let tempPAsteToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.PASTE_TO_EXCEL && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempPAsteToExcelActions.length > 0) {
            tempPAsteToExcelActions.forEach((tempPasteToExcelAction: ExcelAction) => {
                pasteToExcel(tempPasteToExcelAction.id, selectedActiveExcelFile, targetWorksheet, range, openWorksheet, clipboardData)
            })
        }

    }, [offAddInServiceActions])

    const loadBookmark = () => {
        let excelFile = activeExcelFiles.filter((file: ExcelFile) => {
            return file.fileName === selectedBookmark.excelFile.fileName
        })
        if (excelFile.length > 0) {
            setSelectedActiveExcelFile(excelFile[0])
            setSelectedWorksheet(selectedBookmark.targetWorksheet)
            setOpenWorksheet(selectedBookmark.worksheetToOpen)
            setRange(selectedBookmark.range)
        }
    }

    const pasteToExceOnClickl = () => {
        // Need to implement to check logic
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.PASTE_TO_EXCEL && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                pasteToExcel(tempCopyToExcelAction.id, selectedActiveExcelFile, targetWorksheet, range, openWorksheet, clipboardData)
            })
        } else {
            registerPasteToExcel([selectedActiveExcelFile])
        }
    }

    return (
        <div id='ExcelDialog'>
            <textarea id='dummyClipboardDataTextArea' value={JSON.stringify(clipboardData, null, "\t")} onChange={(e) => { setSelectedClipboardData(JSON.parse(e.target.value)) }}></textarea>
            <br /><br />

            <div>
                <PreviousExcelFileList />
                <button onClick={spawnExcelFile}>Spawn</button>
            </div>

            <div>
                <BookmarkList />
                <button onClick={loadBookmark}>Load</button>
                <br /><br />
            </div>

            <div>
                <ActiveExcelFileList />
                <br /><br /><br />
            </div>

            <div>
                <TargetWorksheetList />
                <Range />
                <button onClick={() => { }}>Focus</button>
                <button onClick={() => { }}>Copy</button>
                <button onClick={() => { }}>Clear</button>
                <br />
            </div>

            <div>
                <OpenWorksheetList />
                <button onClick={pasteToExceOnClickl}>Paste</button>

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
        openWorksheet: excelFilesReducer.openWorksheet,
        range: excelFilesReducer.range,
        selectedBookmark: excelFilesReducer.selectedBookmark,
        activeExcelFiles: excelFilesReducer.activeExcelFiles,

    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        registerPasteToExcel: (excelFiles: Array<ExcelFile>) => dispatch(registerActionThunk(CONSTANTS.PASTE_TO_EXCEL, excelFiles)),
        clearSelectedPreviousExcelFiles: () => dispatch(setSelectedPreviousExcelFiles([])),
        clearSelectedActiveExcelFiles: () => dispatch(setSelectedActiveExcelFile(null)),
        setSelectedClipboardData: (clipboardData: {}) => dispatch(setSelectedClipboardData(clipboardData)),
        pasteToExcel: (actionId: string, targetExcelFile: ExcelFile, targeWorksheet: string, range: string, openWorksheet: string, data: []) => dispatch(pasteToExcel(actionId, targetExcelFile, targeWorksheet, range, openWorksheet, data)),
        setSelectedActiveExcelFile: (selectedActiveFile: ExcelFile) => dispatch(setSelectedActiveExcelFile(selectedActiveFile)),
        setSelectedWorksheet: (selectedWorksheet: Worksheet) => dispatch(setTargetWorksheet(selectedWorksheet)),
        setOpenWorksheet: (selectedWorksheet: Worksheet) => dispatch(setOpenWorksheet(selectedWorksheet)),
        setRange: (range: string) => dispatch(setRange(range)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExcelDialog);