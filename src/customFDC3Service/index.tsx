// This line imports type declarations for Finsemble's globals such as FSBL and fdc3. You can ignore any warnings that it is defined but never used.
// Please use global FSBL and fdc3 objects instead of importing from finsemble-core.
import { types } from "@finsemble/finsemble-core";
import { STATE_DISTRIBUTED_STORE_STATE_FIELD, STATE_DISTRIBUTED_STORE_ALLCHANNELS_FIELD, STATE_DISTRIBUTED_STORE_CHECKTIME_FIELD, STATE_DISTRIBUTED_STORE_ACTIVEWINDOWNAME_FIELD, STATE_DISTRIBUTED_STORE_NAME } from "../customFDC3/constants";
import { debug } from "../customFDC3/utils";

const main = () => {	
	const initialState = {};
	initialState[STATE_DISTRIBUTED_STORE_STATE_FIELD] = {};
	//This data is hardcoded currently, but will be retrievable from Finsemble in future (app serice config will need to be moved to finsemble.apps at that time).
	//Please note that the channel ids MUST match those used in the Finsemble Interop service
	initialState[STATE_DISTRIBUTED_STORE_ALLCHANNELS_FIELD] = {
		"Channel 1": { "name": "Channel 1", "color": "#8781BD", "glyph": "1" },
		"Channel 2": { "name": "Channel 2", "color": "#FFE035", "glyph": "2" },
		"Channel 3": { "name": "Channel 3", "color": "#89D803", "glyph": "3" },
		"Channel 4": { "name": "Channel 4", "color": "#FE6262", "glyph": "4" },
		"Channel 5": { "name": "Channel 5", "color": "#2DACFF", "glyph": "5" },
		"Channel 6": { "name": "Channel 6", "color": "#FFA200", "glyph": "6" },
		"Channel 7": { "name": "Channel 7", "color": "#398572", "glyph": "7" },
		"Channel 8": { "name": "Channel 8", "color": "#853556", "glyph": "8" }
	};
	// [
	// 	{"id": "Channel 1", "metadata": { "name": "Channel 1", "color": "#8781BD", "glyph": "1" }},
	// 	{"id": "Channel 2", "metadata": { "name": "Channel 2", "color": "#FFE035", "glyph": "2" }},
	// 	{"id": "Channel 3", "metadata": { "name": "Channel 3", "color": "#89D803", "glyph": "3" }},
	// 	{"id": "Channel 4", "metadata": { "name": "Channel 4", "color": "#FE6262", "glyph": "4" }},
	// 	{"id": "Channel 5", "metadata": { "name": "Channel 5", "color": "#2DACFF", "glyph": "5" }},
	// 	{"id": "Channel 6", "metadata": { "name": "Channel 6", "color": "#FFA200", "glyph": "6" }},
	// 	{"id": "Channel 7", "metadata": { "name": "Channel 7", "color": "#398572", "glyph": "7" }},
	// 	{"id": "Channel 8", "metadata": { "name": "Channel 8", "color": "#853556", "glyph": "8" }}
	// ];
	initialState[STATE_DISTRIBUTED_STORE_CHECKTIME_FIELD] = Date.now();
	initialState[STATE_DISTRIBUTED_STORE_ACTIVEWINDOWNAME_FIELD] = null;
	
	FSBL.Clients.DistributedStoreClient.createStore({
		store: STATE_DISTRIBUTED_STORE_NAME,
		global: true,
		persist: false,
		values: initialState
	}, (err, storeObject) => {
		if (err || !storeObject) {
			//fail over to retrieval - should not be needed, but defensive anyway
			debug(`DistributedStore ${STATE_DISTRIBUTED_STORE_NAME} could not be created!`, err);
		} else {
			//Not needed anymore so might as well close
			window.close();
		}
	});	
};

main();
