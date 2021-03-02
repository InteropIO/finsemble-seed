import * as React from "react";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { copyToExcel, getWorksheetList, registerActionThunk, setSelectedActiveExcelFile, setSelectedClipboardData, setSelectedPreviousExcelFiles, setRange, setTargetWorksheet } from "../redux/actions/actions";
import ExcelFile from "../types/ExcelFile";

import ActiveExcelFileList from "./ActiveExcelFileList";
import PreviousExcelFileList from "./PreviousExcelFileList";
import BookmarkList from "./BookmarkList"
import Range from "./Range";
import OpenWorksheetList from "./OpenWorksheetList";
import TargetWorksheetList from "./TargetWorksheetList";
import * as CONSTANTS from "../redux/actions/actionTypes";
import { ExcelAction } from "../../../ExcelTester/src/types/types";


const CopyToExcelDialog = (props: any) => {
    const { selectedActiveExcelFile, setSelectedActiveExcelFile } = props;
    const { selectedPreviousExcelFiles, clearSelectedPreviousExcelFiles } = props;
    const { clipboardData, setSelectedClipboardData } = props
    const { copyToExcel } = props
    const { targetWorksheet, range, openWorksheet } = props
    const { offAddInServiceActions } = props;
    const { registerCopyToExcel } = props;
    const { selectedBookmark, setSelectedWorksheet } = props
    const { setRange } = props;

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
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.COPY_TO_EXCEL && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                copyToExcel(tempCopyToExcelAction.id, selectedActiveExcelFile, targetWorksheet, range, openWorksheet, clipboardData)
            })
        }

    }, [offAddInServiceActions])

    const loadBookmark = () => {
        setSelectedActiveExcelFile(selectedBookmark.excelFile)
        setSelectedWorksheet(selectedBookmark.targetWorksheet)
        setRange(selectedBookmark.range)

        console.log(selectedBookmark)
        // let range = selectedBookmark.range.substring(selectedBookmark.range.indexOf('!') + 1, selectedBookmark.range.length)
        // let startCell = range.split(':')[0]
        // let endCell = range.split(':')[1]
        // setStartCell(startCell)
        // setEndCell(endCell)
    }

    const pasteToExceOnClickl = () => {
        // Need to implement to check logic
        let tempCopyToExcelActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.COPY_TO_EXCEL && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempCopyToExcelActions.length > 0) {
            tempCopyToExcelActions.forEach((tempCopyToExcelAction: ExcelAction) => {
                //pasteToExcel(tempCopyToExcelAction.id, selectedActiveExcelFile, targetWorksheet, range, openWorksheet, clipboardData)
            })
        } else {
            registerCopyToExcel([selectedActiveExcelFile])
        }
    }

    return (
        <div id='CopyToExcelDialog'>
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
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        registerCopyToExcel: (excelFiles: Array<ExcelFile>) => dispatch(registerActionThunk(CONSTANTS.COPY_TO_EXCEL, excelFiles)),
        clearSelectedPreviousExcelFiles: () => dispatch(setSelectedPreviousExcelFiles([])),
        clearSelectedActiveExcelFiles: () => dispatch(setSelectedActiveExcelFile(null)),
        setSelectedClipboardData: (clipboardData: {}) => dispatch(setSelectedClipboardData(clipboardData)),
        pasteToExcel: (actionId: string, targetExcelFile: ExcelFile, targeWorksheet: string, range: string, openWorksheet: string, data: []) => dispatch(copyToExcel(actionId, targetExcelFile, targeWorksheet, range, openWorksheet, data)),
        setSelectedActiveExcelFile: (selectedActiveFile: ExcelFile) => dispatch(setSelectedActiveExcelFile(selectedActiveFile)),
        setSelectedWorksheet: (selectedWorksheet: {}) => dispatch(setTargetWorksheet(selectedWorksheet)),
        setRange: (range: string) => dispatch(setRange(range)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CopyToExcelDialog);