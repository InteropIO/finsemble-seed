const Finsemble = require("@finsemble/finsemble-core");

const {
	Clients: { RouterClient, Logger },
} = Finsemble;

//Create and export functions which use the router to communicate with your service
export function myFunction(cb) {
	Logger.log("OfficeAddin.myFunction called");
	RouterClient.query("OfficeAddin.myFunction", { hello: "world" }, (err, response) => {
		Logger.log("OfficeAddin.myFunction response: ", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
}

// Exported functions can be imported into your components as follows:
// import {myFunction} from '../../services/OfficeAddin/OfficeAddinClient';

// Doing so allows service functions to be used as if they were local, e.g.:
// myFunction(function(err, response) {
//     if (err) {
//         Logger.error("Failed to call myFunction!", err);
//     } else {
//         Logger.log("called myFunction: ", response);
//     }
// });

// alternatively import the entire class of functions:
// import * as serviceClient from '../../services/OfficeAddin/OfficeAddinClient'
// serviceClient.myFunction(function(err, response) {
//     if (err) {
//         Logger.error("Failed to call myFunction!", err);
//     } else {
//         Logger.log("called myFunction: ", response);
//     }
// });
