import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { setSelectedActiveExcelFile, setSelectedClipboardData, setSelectedPreviousExcelFiles, setRange, setSelectedWorksheet } from "../redux/actions/actions";

import ActiveExcelFileList from "./ActiveExcelFileList";
import PreviousExcelFileList from "./PreviousExcelFileList";
import BookmarkList from "./BookmarkList"
import Range from "./Range";
import TargetWorksheetList from "./TargetWorksheetList";
import ExcelWorksheet from "../../../../services/OfficeAddin/types/ExcelWorksheet";
import ExcelFile from "../../../../services/OfficeAddin/types/ExcelFile";

const ExcelDialog = (props: any) => {
    const { selectedActiveExcelFile, setSelectedActiveExcelFile } = props;
    const { selectedPreviousExcelFiles, clearSelectedPreviousExcelFiles } = props;
    const { clipboardData, setSelectedClipboardData } = props
    const { selectedWorksheet, range } = props
    const { selectedBookmark, setSelectedWorksheet } = props
    const { setRange } = props;

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
        if(selectedBookmark){
            let activeExcelFiles = (FSBL as any).Clients.OfficeAddinClient.getActiveExcelFiles();
            let excelFile = activeExcelFiles.filter((file: ExcelFile) => {
                return file.fileName === selectedBookmark.excelFile.fileName
            })
            if (excelFile.length > 0) {
                setSelectedActiveExcelFile(excelFile[0])
                setSelectedWorksheet(selectedBookmark.worksheet)
                setRange(selectedBookmark.range)
            }
        }
    }, [selectedBookmark])

    const pasteToExceOnClick = () => {
        if(selectedActiveExcelFile){
            (FSBL as any).Clients.OfficeAddinClient.setExcelRange({excelFile: selectedActiveExcelFile, range: range, values:clipboardData, worksheet:selectedWorksheet})
                .then((values: any)=>{
                    console.log(values)
                })
        }
    }

    const focusRangeOnclick = () => {
        if(selectedActiveExcelFile){
            (FSBL as any).Clients.OfficeAddinClient.focusExcelRange({excelFile: selectedActiveExcelFile, range:range, worksheet:selectedWorksheet})
                .then((values: any)=>{
                    console.log(values)
                })
        }
    }

    const copyRangeOnclick = () => {
        if(selectedActiveExcelFile){
            (FSBL as any).Clients.OfficeAddinClient.getExcelRange({excelFile: selectedActiveExcelFile, range:range, worksheet:selectedWorksheet})
                .then((res: any)=>{
                    setSelectedClipboardData(res.values)
                })
        }
    }

    const clearRangeOnclick = () => {
        if(selectedActiveExcelFile){
            (FSBL as any).Clients.OfficeAddinClient.clearExcelRange({excelFile: selectedActiveExcelFile, range: range, worksheet: selectedWorksheet})
                .then((values: any)=>{
                    console.log(values)
                })
        }
    }

    const subscribeValueOnClick = () => {
        if (selectedActiveExcelFile) {
            (FSBL as any).Clients.OfficeAddinClient.onSheetValueChanged({excelFiles: [selectedActiveExcelFile], worksheet: selectedWorksheet, range: range}, (err: any, event: any)=>{
                console.log(event)
                setSelectedClipboardData(event.details)
            })
                .then((values: any)=>{
                    console.log(values)
                })
        } else {
            alert('Please either select a bookmark or an active Excel file.')
        }
    }

    const subscribeSelectionOnClick = () => {
        if (selectedActiveExcelFile) {
            (FSBL as any).Clients.OfficeAddinClient.onSheetSelectionChanged({excelFiles: [selectedActiveExcelFile], worksheet: selectedWorksheet, range: range}, (err: any, event: any)=>{
                console.log(event)
                setRange(event.range)
            })
                .then((values: any)=>{
                    console.log(values)
                })
        } else {
            alert('Please either select a bookmark or an active Excel file.')
        }
    }

    const subscribeBroadcastOnClick = () => {
        if (selectedActiveExcelFile) {
            (FSBL as any).Clients.OfficeAddinClient.onSheetBroadcastValues({excelFiles: [selectedActiveExcelFile], worksheet: selectedWorksheet, range: range}, (err: any, event: any)=>{
                setSelectedClipboardData(event.values)
            })
            .then((values: any)=>{
                console.log(values)
            })
        } else {
            alert('Please either select a bookmark or an active Excel file.')
        }
    }



    return (
        <div id='ExcelDialog'>
            <textarea id='dummyClipboardDataTextArea' value={JSON.stringify(clipboardData, null, "\t")} onChange={(e) => { setSelectedClipboardData(JSON.parse(e.target.value)) }}></textarea>
            <br /><br />

            <div>
                <PreviousExcelFileList />
                <button style={{ marginTop: '35px' }} onClick={spawnExcelFileOnclick}>Spawn</button>
                <br /><br />
            </div>

            <div>
                <BookmarkList />
            </div>

            <div>
                <ActiveExcelFileList />

                <br /><br />
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
                <button onClick={subscribeValueOnClick}>Subscribe Value</button>
                <button onClick={subscribeSelectionOnClick}>Subscribe Selection</button>
                <button onClick={subscribeBroadcastOnClick}>Subscribe Broadcast</button>
            </div>
        </div>
    );
};

const mapStateToProps = (state: any, ownProps: any) => {
    const { excelFilesReducer } = state
    return {
        selectedActiveExcelFile: excelFilesReducer.selectedActiveExcelFile,
        selectedPreviousExcelFiles: excelFilesReducer.selectedPreviousExcelFiles,
        clipboardData: excelFilesReducer.selectedClipboardData,
        selectedWorksheet: excelFilesReducer.selectedWorksheet,
        range: excelFilesReducer.range,
        selectedBookmark: excelFilesReducer.selectedBookmark,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        clearSelectedPreviousExcelFiles: () => dispatch(setSelectedPreviousExcelFiles([])),
        clearSelectedActiveExcelFiles: () => dispatch(setSelectedActiveExcelFile(null)),
        setSelectedClipboardData: (clipboardData: []) => dispatch(setSelectedClipboardData(clipboardData)),
        setSelectedActiveExcelFile: (selectedActiveFile: ExcelFile) => dispatch(setSelectedActiveExcelFile(selectedActiveFile)),
        setSelectedWorksheet: (selectedWorksheet: ExcelWorksheet) => dispatch(setSelectedWorksheet(selectedWorksheet)),
        setRange: (range: string) => dispatch(setRange(range))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExcelDialog);