// import { useEffect, useState } from "react";

// import { useSelector } from 'react-redux';
// import store from '../store';

// const usePins = (pinType: string) => {
//     const toolbar = useSelector((state) => state.toolbar);
//     const [pinnedItems, setPinnedItems] = useState(toolbar.pins[pinType]);

//     const select = (state) => {
//         return state.toolbar.pins;
//     }

//     const handlePinItemsChange = () => {
//         const currentPins = select(store.getState());
//         setPinnedItems(currentPins);
//     }

//     useEffect(() => {
// 		const unsubscribeToPinnedItems = store.subscribe(handlePinItemsChange);
//         return () => {
//             unsubscribeToPinnedItems();
//         }
// 	});

//     return pinnedItems;
// };

// export default usePins;