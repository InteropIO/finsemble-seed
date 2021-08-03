import * as React from "react";
import { useEffect, useState } from "react";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { setSelectedPreviousExcelFiles } from "../redux/actions/actions";
import ExcelFile from "../../../../services/OfficeAddin/types/ExcelFile";

const PreviousExcelFileList = (props: any) => {
    const animatedComponents = makeAnimated();
    const customStyles = {
        option: (provided: any, state: any) => ({
            ...provided,
            color: 'black'
        }),
        container: (provided: any, state: any) => ({
            ...provided,
            float: 'left',
            width: '100%'
        }),
    }

    const { setSelectedFiles, selectedFiles } = props;
    const [previousExcelFiles, setPreviousExcelFiles] = useState(Array<ExcelFile>());

    const getPreviousExcelFiles = () => {
        let tempPreviousExcelFiles:Array<ExcelFile> = [];
        let activeExcelFiles:Array<ExcelFile> = (FSBL as any).Clients.OfficeAddinClient.getActiveExcelFiles();
        (FSBL as any).Clients.OfficeAddinClient.getPreviousExcelFiles().forEach((previousExcelFile: ExcelFile)=>{
            if(!activeExcelFiles.includes(previousExcelFile))
                tempPreviousExcelFiles.push(previousExcelFile)
        })

        setPreviousExcelFiles(tempPreviousExcelFiles)
    }

    return (
        <div className='previousFileListDiv'>
            <label htmlFor="excelFileList">Previous Excel File List</label>
            <Select
                isMulti
                styles={customStyles}
                closeMenuOnSelect={false}
                components={animatedComponents}
                getOptionLabel={({ fileName }) => fileName}
                getOptionValue={({ filePath }) => filePath}
                onMenuOpen={() => {
                    getPreviousExcelFiles()
                }}
                options={previousExcelFiles}
                onChange={setSelectedFiles}
                value={selectedFiles}
            />
        </div>
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { excelFilesReducer } = state
    return {
        selectedFiles: excelFilesReducer.selectedPreviousExcelFiles,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setSelectedFiles: (selectedPreviousExcelFiles: Array<ExcelFile>) => dispatch(setSelectedPreviousExcelFiles(selectedPreviousExcelFiles)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PreviousExcelFileList);
