import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { registerActionThunk, setSelectedActiveExcelFiles } from "../redux/actions/actions";
import * as CONSTANTS from '../redux/actions/actionTypes';
import { useEffect } from "react";
import ExcelFile from "../types/ExcelFile";

const ActiveExcelFileList = (props: any) => {
    const { registerAction } = props;
    const { activeExcelFiles } = props;
    const { selectedActiveExcelFiles, setSelectedActiveExcelFiles } = props;
    const customStyles = {
        option: (provided: any, state: any) => ({
            ...provided,
            color: 'black'
        })
    }
    const animatedComponents = makeAnimated();

    useEffect(() => {
        registerAction(CONSTANTS.SUBSCRIBE_ACTIVE_EXCEL_FILES)
        registerAction(CONSTANTS.GET_ACTIVE_EXCEL_FILES)
    }, [])

    return (
        <div className="">
            <label htmlFor="excelFileList">Active Excel File List:</label>
            <Select
                isMulti
                options={activeExcelFiles}
                closeMenuOnSelect={false}
                components={animatedComponents}
                getOptionLabel={({ fileName }) => fileName}
                getOptionValue={({ filePath }) => filePath}
                onChange={setSelectedActiveExcelFiles}
                value={selectedActiveExcelFiles}
                styles={customStyles}
            />
        </div>
    );
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        activeExcelFiles: excelFilesReducer.activeExcelFiles,
        selectedActiveExcelFiles: excelFilesReducer.selectedActiveExcelFiles
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setSelectedActiveExcelFiles: (selectedActiveFiles: Array<ExcelFile>) => dispatch(setSelectedActiveExcelFiles(selectedActiveFiles)),
        registerAction: (action: string) => dispatch(registerActionThunk(action))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ActiveExcelFileList);