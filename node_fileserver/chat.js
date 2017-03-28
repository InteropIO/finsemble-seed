var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var request = require('request');
var io = require('socket.io')();
var cookie = require('cookie');
var uuidV1 = require('uuid/v1');
var path = require("path");
var sessions = {};
var sockets = {};
function setupChatRoutes(app, server) {
	var slack = require("./slack");

	var session = require('express-session')({
		secret: 'fin sec',
		key: "finId",
		resave: true,
		saveUninitialized: true,
		cookie: {
			secure: true,
			expires: 600000
		}
	});

	//var server = require('http').createServer(app);
	var io = require('socket.io')(server);
	app.use(cookieParser());

	app.use(session);

	global.slackConnections = {};



	//app.use(express.static(__dirname + '/dist'))

	app.get("/chat", function (req, res) {
		
		res.sendFile(path.join(__dirname, "..", "dist/components/chat/chat.html"));
	});

	app.get("/checkAuth", function (req, res) {
		var session = sessions[req.cookies.io];
		res.send({
			authed: session ? session.auth ? true : false : false
		});
	});
	app.get("/slackAuth", function (req, res) {
		slack.auth(req, res);
	});


	//slack redirect
	app.use("/loginRedirect", function (req, res) {
		req.session.auth = {
			code: req.query.code,
			state: req.query.state
		};
		sessions[req.cookies.io].auth = {
			code: req.query.code,
			state: req.query.state
		};
		slack.getAccess(sessions[req.cookies.io],req, function (err, data) {
			if (err) { console.log("err", err); };
			console.log("emit authed");
			var socket = sockets[req.cookies.io];
			socket.emit("authed", { authed: true });
			console.log(err);
			slack.newRTMConnection(socket, sessions[req.cookies.io], function () {
				setupSocketRoutes(socket);
				res.redirect('/components/chat/chat.html');
			});

			//});
		});
	});

	function reloadSession(req) {
		req.session = sessions[req.cookies.io];
	}

	io.set('authorization', function (handshake, callback) {
		sessions[handshake.headers.finID] = {};
		handshake.headers.cookie;
		callback(null, true);
	});
	io.on('connection', function (socket) {
		sessions[socket.id] = {};
		sockets[socket.id] = socket;
		socket.on('disconnect', function () {
			console.log(socket.name + ' has disconnected from the chat.' + socket.id);
		});
	});
	function setupSocketRoutes(socket) {
		socket.on("login", function (msg) {
			slack.auth(sessions[socket.handshake.headers.cookie], function (err, data) {
				if (err) { return socket.emit("error", err); }
				socket.emit("loggedIn");
			});
		});
		socket.on("getChannels", function (msg) {
			slack.getChannelList(socket.session, function (err, data) {
				if (err) { return socket.emit("error", err); }
				socket.emit("returnChannels", data);
			});
		});
		socket.on("getMPIMList", function (msg) {
			slack.getMPIMList(socket.session, function (err, data) {
				if (err) { return socket.emit("error", err); }
				socket.emit("return MPIM", data);
			});
		});
		socket.on("channelHistory", function (msg) {
			//socket.session.activeChannel = msg.channel;
			slack.channelHistory(sessions[socket.id],msg.channel, function (err, data) {
				socket.emit("channelHistory",  {id:msg.id,msgList:data});
			});
		});

		socket.on("DMHistory", function (msg) {
			slack.IMHistory(sessions[socket.id],msg.channel, function (err, data) {
				socket.emit("DMHistory", {id:msg.id,msgList:data});
			});
		});

		socket.on("mpimHistory", function (msg) {
			slack.mpimHistory(sessions[socket.id],msg.channel, function (err, data) {
				socket.emit("mpimHistory", {id:msg.id,msgList:data});
			});
		});
		socket.on("groupHistory", function (msg) {
			slack.groupHistory(sessions[socket.id],msg.channel, function (err, data) {
				socket.emit("groupHistory", {id:msg.id,msgList:data});
			});
		});
		socket.on("markChannel",function(msg){
			slack.markChannel(sessions[socket.id],msg.channel, function (err, data) {
				console.log("markChannel",err,data);
			});
		});
		socket.on("markGroup",function(msg){
			slack.markGroup(sessions[socket.id],msg.channel, function (err, data) {
				console.log("markGroup",err,data);
			});
		});
		socket.on("markDM",function(msg){
			slack.markDM(sessions[socket.id],msg.channel, function (err, data) {
				console.log("markDM",err,data);
			});
		});
		
		socket.on("sendMsg", function (msg) {
			global.slackConnections[sessions[socket.id].id].sendMessage(msg.msg, msg.channelId);
		});

	}

}
module.exports.setup = setupChatRoutes;