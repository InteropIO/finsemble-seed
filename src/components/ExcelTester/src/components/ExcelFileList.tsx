import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { getExcelFileListThunk } from "./../redux/actions/actions";
import { GET_EXCEL_FILE_LIST } from './../redux/actions/actionTypes';
import { action } from './../types/types';

const animatedComponents = makeAnimated();

const ExcelFileList = (props: any) => {
    const { excelFileList, offAddInServiceActions, getExcelFileList } = props;

    return (
        <div className="">
            <label htmlFor="excelFileList">Excel File List:</label>
            <Select
                isMulti
                options={excelFileList}
                closeMenuOnSelect={false}
                components={animatedComponents}
                getOptionLabel={({ fileName }) => fileName}
                getOptionValue={({ filePath }) => filePath}
                onMenuOpen={() => {
                    let getExcelFileAction = offAddInServiceActions.find((offAddInServiceAction: action) => { return offAddInServiceAction.action === GET_EXCEL_FILE_LIST })
                    if(getExcelFileAction)
                        getExcelFileList(getExcelFileAction.id)
                    else
                        getExcelFileList('')
                }}
            />
        </div>
    );
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        excelFileList: excelFilesReducer.excelFileList,
        offAddInServiceActions: officeAddinServiceActionsReducer.offAddInServiceActions
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        getExcelFileList: (actionId: string) => dispatch(getExcelFileListThunk(actionId))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExcelFileList);