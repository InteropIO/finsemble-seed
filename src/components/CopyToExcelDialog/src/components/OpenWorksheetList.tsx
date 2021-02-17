import * as React from "react";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import ExcelFile from "../types/ExcelFile";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { getWorksheetListThunk, registerActionThunk, setOpenWorksheet } from "../redux/actions/actions";
import * as CONSTANTS from "../redux/actions/actionTypes";
import { useEffect, useState } from "react";
import { ExcelAction } from "../../../ExcelTester/src/types/types";

const OpenWorksheetList = (props: any) => {
    const animatedComponents = makeAnimated();
    const customStyles = {
        option: (provided: any, state: any) => ({
            ...provided,
            color: 'black'
        })
    }

    const { worksheetList, getWorksheetList } = props;
    const { selectedWorksheet, setSelectedWorksheet } = props;
    const { selectedActiveExcelFile } = props;
    const { offAddInServiceActions } = props;
    const { registerGetWorksheetList } = props;

    let [getWorksheetListActions, setGetWorksheetListActions] = useState<Array<ExcelAction>>([])

    useEffect(() => {
        let tempGetWorksheetListActions = offAddInServiceActions.filter((offAddInServiceAction: ExcelAction) => {
            return offAddInServiceAction.action === CONSTANTS.GET_WORKSHEET_LIST && offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName
        })
        if (tempGetWorksheetListActions.length > 0) {
            setGetWorksheetListActions(tempGetWorksheetListActions)
            tempGetWorksheetListActions.forEach((getWorksheetListAction: ExcelAction) => {
                getWorksheetList(getWorksheetListAction.id, getWorksheetListAction.file)
            })
        }

    }, [offAddInServiceActions])

    return (
        <div style={{ float: 'left', width: '50%' }}>
            <label htmlFor="excelFileList">Open Worksheet</label>
            <Select
                styles={customStyles}
                closeMenuOnSelect={true}
                components={animatedComponents}
                getOptionLabel={({ name }) => name}
                getOptionValue={({ id }) => id}
                onMenuOpen={() => {
                    setSelectedWorksheet("")
                    if (selectedActiveExcelFile) {
                        let newAction = false
                        let tempGetWorksheetListAction = getWorksheetListActions.find((offAddInServiceAction: ExcelAction) => {
                            return offAddInServiceAction.file?.fileName === selectedActiveExcelFile.fileName && offAddInServiceAction.action === CONSTANTS.GET_WORKSHEET_LIST
                        })

                        if (!tempGetWorksheetListAction) {
                            newAction = true
                            registerGetWorksheetList([selectedActiveExcelFile])
                        } else {
                            getWorksheetList(tempGetWorksheetListAction.id, selectedActiveExcelFile);
                        }
                    } else {
                        getWorksheetList("", []);
                    }
                }}
                options={worksheetList}
                onChange={setSelectedWorksheet}
                value={selectedWorksheet}
            />
        </div>
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        selectedActiveExcelFile: excelFilesReducer.selectedActiveExcelFile,
        worksheetList: excelFilesReducer.worksheetList,
        selectedWorksheet: excelFilesReducer.openWorksheet,
        offAddInServiceActions: officeAddinServiceActionsReducer.offAddInServiceActions
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        registerGetWorksheetList: (excelFiles: Array<ExcelFile>) => dispatch(registerActionThunk(CONSTANTS.GET_WORKSHEET_LIST, excelFiles)),
        getWorksheetList: (actionId: string, excelFile: ExcelFile) => dispatch(getWorksheetListThunk(actionId, excelFile)),
        setSelectedWorksheet: (selectedWorksheet: {}) => dispatch(setOpenWorksheet(selectedWorksheet)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OpenWorksheetList);
