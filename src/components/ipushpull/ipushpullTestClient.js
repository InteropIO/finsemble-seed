const Logger = FSBL.Clients.Logger;
const RouterClient =  FSBL.Clients.RouterClient;

export function getUserDetails(cb) {
	Logger.log("getUserDetails called");
	RouterClient.query("iPushPull test server", { query: "user details" }, function (err, response) {
		Logger.log("iPushPullClient.getUserDetails response: ", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

export function getUserDocs(userDeets, cb) {
	Logger.log("getUserDocs called");
	RouterClient.query("iPushPull test server", { query: "user docs", user: userDeets }, function (err, response) {
		Logger.log("iPushPullClient.getUserDocs response: ", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};

export function getLoginToken(userDeets, cb) {
	Logger.log("getLoginToken called");
	RouterClient.query("iPushPull test server", { query: "login token", user: userDeets }, function (err, response) {
		Logger.log("iPushPullClient.getLoginToken response", response.data);
		if (cb) {
			cb(err, response.data);
		}
	});
};