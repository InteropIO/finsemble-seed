import * as React from "react";
import { useEffect, useState } from "react";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { connect } from "react-redux";
import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk"
import { setSelectedBookmark } from "../redux/actions/actions";
import ExcelBookmark from "../../../../services/OfficeAddin/types/ExcelBookmark";

const BookmarkList = (props: any) => {
    const animatedComponents = makeAnimated();
    const customStyles = {
        option: (provided: any, state: any) => ({
            ...provided,
            color: 'black'
        }),
        container:(provided: any, state: any) => ({
            ...provided,
            float: 'left',
            width: '100%',
        }),
    }

    const { selectedBookmark, setSelectedBookmark } = props;

    const [bookmarkList, setBookmarkList] = useState(Array<ExcelBookmark>())

    useEffect(() => {
        FSBL.Clients.DistributedStoreClient.getStore({ store: "excelBookmarkStore" }, (err: any, store: any) => {
            store.getValue({ field: 'bookmarks' }, (err: any, data: Array<ExcelBookmark>) => { setBookmarkList(data) });
            store.addListener({ field: 'bookmarks' }, (err: any, data: any) => { setBookmarkList(data.value) });
        })
    }, [])

    return (
        <div className="bookmarkListDiv">
            <label htmlFor="excelFileList">Bookmark List</label>
            <Select
                styles={customStyles}
                closeMenuOnSelect={true}
                components={animatedComponents}
                getOptionLabel={({ name }) => name}
                getOptionValue={({ name }) => name}
                options={bookmarkList}
                onChange={setSelectedBookmark}
                value={selectedBookmark}
            />
        </div>
    )
}

const mapStateToProps = (state: any, ownProps: any) => {
    const { officeAddinServiceActionsReducer, excelFilesReducer } = state
    return {
        selectedBookmark: excelFilesReducer.selectedBookmark,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setSelectedBookmark: (selectedBookmark: ExcelBookmark) => dispatch(setSelectedBookmark(selectedBookmark)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BookmarkList);
