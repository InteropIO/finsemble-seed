import { ExcelAction } from '../../types/types';
import { OFFICE_ADDIN_REGISTER, OfficeAddinActionType } from '../actions/actionTypes';

const initialState = {
    offAddInServiceActions: Array<ExcelAction>()
}

export default (state = initialState, action: OfficeAddinActionType) => {
    switch (action.type) {
        case OFFICE_ADDIN_REGISTER: {
            let result = [...state.offAddInServiceActions, ...action.payload.regsiteredActions].reduce((res:Array<ExcelAction>, data, index, arr) => {
                res.push(data);
                return res;
              }, [])
            return {
                ...state,
                offAddInServiceActions: result
            }   
        }
        default:
            return state;
    }
}


