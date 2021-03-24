import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { registerActionThunk, setSelectedActiveExcelFile } from "../redux/actions/actions";
import * as CONSTANTS from '../redux/actions/actionTypes';
import { useEffect } from "react";
import ExcelFile from "../types/ExcelFile";

const ActiveExcelFileList = (props: any) => {
    const { registerAction } = props;
    const { activeExcelFiles } = props;
    const { selectedActiveExcelFile, setSelectedActiveExcelFile } = props;
    const customStyles = {
        option: (provided: any, state: any) => ({
            ...provided,
            color: 'black'
        }),
        container:(provided: any, state: any) => ({
            ...provided,
            float: 'left',
            width: '100%'
        }),
    }
    const animatedComponents = makeAnimated();

    useEffect(() => {
        registerAction(CONSTANTS.SUBSCRIBE_ACTIVE_EXCEL_FILES)
        registerAction(CONSTANTS.GET_ACTIVE_EXCEL_FILES)
    }, [])

    return (
        <div>
            <label htmlFor="excelFileList">Active Excel File List</label>
            <br/>
            <Select
                options={activeExcelFiles}
                closeMenuOnSelect={true}
                components={animatedComponents}
                getOptionLabel={({ fileName }) => fileName}
                getOptionValue={({ filePath }) => filePath}
                onChange={setSelectedActiveExcelFile}
                value={selectedActiveExcelFile}
                styles={customStyles}
            />
        </div>
    );
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        activeExcelFiles: excelFilesReducer.activeExcelFiles,
        selectedActiveExcelFile: excelFilesReducer.selectedActiveExcelFile
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setSelectedActiveExcelFile: (selectedActiveFile: ExcelFile) => dispatch(setSelectedActiveExcelFile(selectedActiveFile)),
        registerAction: (action: string) => dispatch(registerActionThunk(action))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ActiveExcelFileList);