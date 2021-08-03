import * as React from "react";
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { setSelectedActiveExcelFile } from "../redux/actions/actions";
import { useEffect, useState } from "react";
import ExcelFile from "../../../../services/OfficeAddin/types/ExcelFile";

const ActiveExcelFileList = (props: any) => {
    const [activeExcelFiles, setActiveExcelFiles] = useState(Array<ExcelFile>());
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
        setActiveExcelFiles(FSBL.Clients.OfficeAddinClient.getActiveExcelFiles())
        FSBL.Clients.OfficeAddinClient.onActiveExcelFilesChange({}, (res)=>{
            setActiveExcelFiles(res.activeExcelFiles)
        })
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
    const { excelFilesReducer } = state
    return {
        activeExcelFiles: excelFilesReducer.activeExcelFiles,
        selectedActiveExcelFile: excelFilesReducer.selectedActiveExcelFile
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setSelectedActiveExcelFile: (selectedActiveFile: ExcelFile) => dispatch(setSelectedActiveExcelFile(selectedActiveFile)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ActiveExcelFileList);
