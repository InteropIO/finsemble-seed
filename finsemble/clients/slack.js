/*!
* Copyright 2017 by ChartIQ, Inc.
* All rights reserved.
*/
var request = require("superagent");
var accessOptions = { client_id: "18152651095.115655546097", client_secret: "de8d68d99c41221aa7d6ae02d5bda02f" };

var credentials = {
	client: {
		id: "18152651095.115655546097",
		secret: "de8d68d99c41221aa7d6ae02d5bda02f"
	},
	auth: {
		tokenHost: "https://slack.com/oauth"
	}
};
var serverConfigs = {
	"production": "finsemble.chartiq.com",
	"staging": "finsemble-staging.chartiq.com",
	"dev": "localhost"
};
var finHost = serverConfigs[process.env.NODE_ENV];
if (!finHost) { finHost = "localhost"; }
function auth(req, res) {
	console.log("process.env", process.env.NODE_ENV);
	var oauth2 = require("simple-oauth2").create(credentials);
	const authorizationUri = oauth2.authorizationCode.authorizeURL({
		redirect_uri: req.protocol + "://" + finHost + "/loginredirect",
		scope: "client"
	});
	res.redirect(authorizationUri);
}

var slackAccess = "https://slack.com/api/oauth.access";
function getAccessToken(session, req, callback) {
	request
		.get(slackAccess)
		.query({ "client_id": accessOptions.client_id, "client_secret": accessOptions.client_secret, "code": session.auth.code, "redirect_uri": req.protocol + "://" + finHost + "/loginredirect" })
		.end(function (err, res) {
			if (err) { return callback(err); }
			if (!res.body.ok) { return callback(res.body); }
			session.auth.access_token = res.body.access_token;
			session.auth.scope = res.body.scope;
			session.auth.user = res.body.user_id;
			session.auth.team = res.body.team;
			session.auth.team_id = res.body.team_id;

			return callback(err, res.body);
		});
}

module.exports = {
	auth: auth,
	getAccess: getAccessToken
};
