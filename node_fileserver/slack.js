var Slack = require('slack-api');
var request = require('superagent');
var accessOptions = { client_id: "18152651095.115655546097", client_secret: "de8d68d99c41221aa7d6ae02d5bda02f" };
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var WebClient = require('@slack/client').WebClient;
var moment = require("moment");
//console.log("RTM_EVENTS",RTM_EVENTS)
//console.log("CLIENT_EVENTS",CLIENT_EVENTS);
var web;

function newRTMConnection(socket, session, callback) {
	console.log("rtm session", session);
	var rtm = new RtmClient(session.auth.access_token);
	setupSlackRTM(socket, session, rtm);
	global.slackConnections[session.id] = rtm;
	rtm.start();
	callback();

}

function setupSlackRTM(socket, session, rtm) {
	rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
		getMultiDirectMessageList(session, function (err, response) {
			rtmStartData.mpim = response.groups;
			socket.emit("loaded", rtmStartData);
		});

	});
	rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
	});

	rtm.on(CLIENT_EVENTS.RTM.WS_ERROR, function (err) {
		rtm.sendMessage("Hello!", err);
	});

	rtm.on(RTM_EVENTS.IM_MARKED, function handleRtmMessage(message) {
		console.log('dmMarked:', message);
		socket.emit("dmMarked", message);
	});

	rtm.on(RTM_EVENTS.GROUP_MARKED, function handleRtmMessage(message) {
		console.log('groupMarked:', message);
		socket.emit("groupMarked", message);
	});
	rtm.on(RTM_EVENTS.CHANNEL_MARKED, function handleRtmMessage(message) {
		console.log('channelMarked:', message);
		socket.emit("channelMarked", message);
	});
	rtm.on(RTM_EVENTS.MPIM_OPEN, function handleRtmMessage(message) {
		console.log('MPIM_OPEN:', message);

	});
	rtm.on(RTM_EVENTS.MPIM_JOINED, function handleRtmMessage(message) {
		console.log('MPIM_JOINED:', message);

	});
	rtm.on(RTM_EVENTS.USER_TYPING, function handleRtmMessage(message) {
		console.log('USER_TYPING:', message);

	});
	rtm.on(RTM_EVENTS.CHANNEL_CREATED, function handleRtmMessage(message) {
		console.log('CHANNEL_CREATED:', message);

	});
	rtm.on(RTM_EVENTS.CHANNEL_DELETED, function handleRtmMessage(message) {
		console.log('CHANNEL_DELETED:', message);

	});
	rtm.on(RTM_EVENTS.CHANNEL_MARKED, function handleRtmMessage(message) {
		console.log('CHANNEL_MARKED:', message);

	});




	rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
		console.log('Message:', message);
		/*Object
			channel:"D3J5SLQ77"
			team:"T3JNM7M9C"
			text:"aaaaaaaaaaaaaay"
			ts:"1488999990.000003"
			type:"message"
			user:"U3HB9D1HN"*/
		socket.emit("msgReceived", message);
	});
}


var credentials = {
	client: {
		id: '18152651095.115655546097',
		secret: 'de8d68d99c41221aa7d6ae02d5bda02f'
	},
	auth: {
		tokenHost: 'https://slack.com/oauth'
	}
};
var serverConfigs = {
	"Production":"finsemble.chartiq.com",
	"staging":"finsemble-staging.chartiq.com",
	"dev":"localhost"

};
var finHost = serverConfigs[process.env.NODE_ENV];
if(!finHost) {finHost = "localhost";};
function auth(req, res) {
	console.log("process.env", process.env.NODE_ENV);
	//var host = process.env.NODE_ENV === "Production" ? "finsemble.chartiq.com" : "localhost";
	var oauth2 = require('simple-oauth2').create(credentials);
	const authorizationUri = oauth2.authorizationCode.authorizeURL({
		redirect_uri: req.protocol + '://' + finHost + "/loginredirect",
		scope: 'client'
	});
	res.redirect(authorizationUri);
}

var slackAccess = "https://slack.com/api/oauth.access";
function getAccessToken(session, req, callback) {
	//var host = process.env.NODE_ENV === "Production" ? "finsemble.chartiq.com" : "localhost";
	request
		.get(slackAccess)
		.query({ "client_id": accessOptions.client_id, "client_secret": accessOptions.client_secret, "code": session.auth.code, "redirect_uri": req.protocol + '://' + finHost + "/loginredirect" })
		.end(function (err, res) {
			if (err) { return callback(err); }
			if (!res.body.ok) { return callback(res.body); }
			session.auth.access_token = res.body.access_token;
			session.web = new WebClient(res.body.access_token);
			session.auth.scope = res.body.scope;
			session.auth.user = res.body.user_id;
			session.auth.team = res.body.team;
			session.auth.team_id = res.body.team_id;

			return callback(err);
		});

}

function channelHistory(session, channel, callback) {
	var url = "https://slack.com/api/channels.history";
	var options = {
		token: session.auth.access_token,//required
		"channel": channel,//required
		"count": 50//required
	};
	request
		.get(url)
		.query(options)
		.end(function (err, res) {
			if (err) { return callback(err); }

			return callback(err, res.body);
		});
}
function IMHistory(session, channel, callback) {
	console.log("here,,,,,", channel);
	var url = "https://slack.com/api/im.history";
	var options = {
		token: session.auth.access_token,//required
		"channel": channel,//required
		"count": 50//required
	};
	request
		.get(url)
		.query(options)
		.end(function (err, res) {
			console.log("got msgs......");
			if (err) { return callback(err); }

			return callback(err, res.body);
		});
}
function mpimHistory(session, channel, callback) {
	console.log("here,,,,,", channel);
	var url = "https://slack.com/api/mpim.history";
	var options = {
		token: session.auth.access_token,//required
		"channel": channel,//required
		"count": 50//required
	};
	request
		.get(url)
		.query(options)
		.end(function (err, res) {
			console.log("got msgs......");
			if (err) { return callback(err); }

			return callback(err, res.body);
		});
}
function groupHistory(session, channel, callback) {
	console.log("here,,,,,", channel);
	var url = "https://slack.com/api/group.history";
	var options = {
		token: session.auth.access_token,//required
		"channel": channel,//required
		"count": 50//required
	};
	request
		.get(url)
		.query(options)
		.end(function (err, res) {
			console.log("got msgs......");
			if (err) { return callback(err); }

			return callback(err, res.body);
		});
}
function getChannelList(session, callback) {
	var url = "https://slack.com/api/channels.list";

	request
		.get(url)
		.query({ "token": session.auth.access_token })
		.end(function (err, res) {
			if (err) { return callback(err); }
			//console.log("body",res.body);
			return callback(err, res.body);
		});

}
function getMultiDirectMessageList(session, callback) {
	var url = "https://slack.com/api/mpim.list";

	request
		.get(url)
		.query({ "token": session.auth.access_token })
		.end(function (err, res) {
			if (err) { return callback(err); }
			console.log("getMultiDirectMessageList", res.body);
			return callback(err, res.body);
		});
}
function markMultiDirectMessage(session, callback) {
	var url = "https://slack.com/api/mpim.mark";

	request
		.get(url)
		.query({ "token": session.auth.access_token })
		.end(function (err, res) {
			if (err) { return callback(err); }
			console.log("getMultiDirectMessageList", res.body);
			return callback(err, res.body);
		});
}

function markChannel(session, channel, callback) {
	var url = "https://slack.com/api/channels.mark";

	request
		.post(url)
		 .set('Content-Type', 'application/json')
		.query({ "token": session.auth.access_token })
		.send({ channel: channel, ts: new Date() })
		.end(function (err, res) {
			console.log("markChannel", res.body);
			if (err) { return callback(err); }

			return callback(err, res.body);
		});
}
function markGroup(session, channel, callback) {
	var url = "https://slack.com/api/groups.mark";

	request
		.post(url)
		 .set('Content-Type', 'application/json')
		.query({ "token": session.auth.access_token })
		.send({ channel: channel, ts: new Date() })
		.end(function (err, res) {
			console.log("markGroup", res.body);
			if (err) { return callback(err); }

			return callback(err, res.body);
		});
}

function markDM(session, channel, callback) {
	var url = "https://slack.com/api/im.mark";
	console.log("markDM ccc",channel);
	session.web.im.mark(channel,moment().unix(),function(err,info){
		console.log("markDM",err,info);
	});
	/*request
		.post(url)
		 .set('Content-Type', 'application/json; charset=UTF-8')
		.query({ "token": session.auth.access_token })
		.send({ channel: channel, ts: new Date() })
		.end(function (err, res) {
			console.log("markDM", res.body);
			if (err) { return callback(err); }

			return callback(err, res.body);
		});*/
}





module.exports = {
	auth: auth,
	getAccess: getAccessToken,
	getChannelList: getChannelList,
	newRTMConnection: newRTMConnection,
	channelHistory: channelHistory,
	IMHistory: IMHistory,
	getMPIMList: getMultiDirectMessageList,
	mpimHistory: mpimHistory,
	groupHistory: groupHistory,
	markChannel: markChannel,
	markGroup: markGroup,
	markDM: markDM

};
