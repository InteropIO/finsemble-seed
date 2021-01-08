import { action } from '../../types/types';
import { OFFICE_ADDIN_REGISTER, OfficeAddinActionType } from '../actions/actionTypes';
import { GET_EXCEL_FILE_LIST } from './../actions/actionTypes';

const initialState = {
    offAddInServiceActions: Array<action>()
}

export default (state = initialState, action: OfficeAddinActionType) => {
    switch (action.type) {
        case OFFICE_ADDIN_REGISTER: {
            return {
                ...state,
                offAddInServiceActions: action.payload.regsiteredActions
            }   
        }
        default:
            return state;
    }
}


