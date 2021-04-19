import * as React from "react";
import { useEffect } from "react";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { getPreviousExcelFilesThunk, setSelectedPreviousExcelFiles } from "../redux/actions/actions";
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

    const { previousExcelFiles, getPreviousExcelFiles } = props;
    const { setSelectedFiles, selectedFiles } = props;

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
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        previousExcelFiles: excelFilesReducer.previousExcelFiles,
        selectedFiles: excelFilesReducer.selectedPreviousExcelFiles,
        offAddInServiceActions: officeAddinServiceActionsReducer.offAddInServiceActions
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        getPreviousExcelFiles: () => dispatch(getPreviousExcelFilesThunk()),
        setSelectedFiles: (selectedPreviousExcelFiles: Array<ExcelFile>) => dispatch(setSelectedPreviousExcelFiles(selectedPreviousExcelFiles)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PreviousExcelFileList);
