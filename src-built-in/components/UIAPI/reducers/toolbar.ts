// import { loop, Cmd } from 'redux-loop';

// import { ActionTypes } from '../types';
// import { loadPinnedItems } from '../effects/toolbar';

// const initialState = {
//     pins: {
//         workspace: {

//         },
//         component: {

//         }
//     }
// };

// export const toolbar = (state = initialState, action) => {
//     const { type, payload } = action;
//     switch (type) {
//         case ActionTypes.INITIALIZE_PINS:
//             return loop(state, Cmd.run(loadPinnedItems, {
//                 args: [...payload]
//             }));
//         default:
//             return state;
//     }
// }