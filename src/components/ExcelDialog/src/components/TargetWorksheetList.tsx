import * as React from "react";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { setSelectedWorksheet } from "../redux/actions/actions";
import { useEffect, useState } from "react";
import ExcelWorksheet from "../../../../services/OfficeAddin/types/ExcelWorksheet";

const TargetWorksheetList = (props: any) => {
    const animatedComponents = makeAnimated();
    const customStyles = {
        option: (provided: any, state: any) => ({
            ...provided,
            color: 'black'
        })
    }

    const [ worksheetList, setWorksheetList] = useState(Array<ExcelWorksheet>())
    const { selectedWorksheet, setSelectedWorksheet } = props;
    const { selectedActiveExcelFile } = props;

    useEffect(() => {
        if(selectedActiveExcelFile)
            FSBL.Clients.OfficeAddinClient.getWorksheetList({excelFile: selectedActiveExcelFile})
                .then((worksheetList)=>{
                    setWorksheetList(worksheetList)
                })
    }, [selectedActiveExcelFile])

    return (
        <div style={{ float: 'left', width: '70%' }}>
            <label htmlFor="excelFileList">Target Worksheet</label>
            <Select
                styles={customStyles}
                closeMenuOnSelect={true}
                components={animatedComponents}
                getOptionLabel={({ name }) => name}
                getOptionValue={({ id }) => id}
                onMenuOpen={() => { }}
                options={worksheetList}
                onChange={setSelectedWorksheet}
                value={selectedWorksheet}
            />
        </div>
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { excelFilesReducer } = state
    return {
        selectedActiveExcelFile: excelFilesReducer.selectedActiveExcelFile,
        selectedWorksheet: excelFilesReducer.selectedWorksheet,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setSelectedWorksheet: (selectedWorksheet: ExcelWorksheet) => dispatch(setSelectedWorksheet(selectedWorksheet)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TargetWorksheetList);
