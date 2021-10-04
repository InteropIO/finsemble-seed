const Finsemble = require("@finsemble/finsemble-core");
import BloombergBridgeClient from "../../clients/BloombergBridgeClient/BloombergBridgeClient";

Finsemble.Clients.Logger.start();
Finsemble.Clients.Logger.log("Symphony Service starting up");

//Setup the BloombergBridgeClient that will be used for all messaging to/from Bloomberg
const bbg = new BloombergBridgeClient(Finsemble.Clients.RouterClient, Finsemble.Clients.Logger);

/** Flag used to track whether we are currently connected to a Bloomberg terminal.
 * Both the Bloomberg terminal and the BloombergBridge must be runnign for this 
 * to be true.
 */
 let connectedToBbg = false;

// Add and initialize any other clients you need to use (services are initialized by the system, clients are not):
// Finsemble.Clients.AuthenticationClient.initialize();
// Finsemble.Clients.ConfigClient.initialize();
// Finsemble.Clients.DialogManager.initialize();
// Finsemble.Clients.DistributedStoreClient.initialize();
// Finsemble.Clients.DragAndDropClient.initialize();
// Finsemble.Clients.LauncherClient.initialize();
// Finsemble.Clients.LinkerClient.initialize();
// Finsemble.Clients.HotkeyClient.initialize();
// Finsemble.Clients.SearchClient.initialize();
// Finsemble.Clients.StorageClient.initialize();
// Finsemble.Clients.WindowClient.initialize();
// Finsemble.Clients.WorkspaceClient.initialize();

// NOTE: When adding the above clients to a service, be sure to add them to the start up dependencies.

/**
 * TODO: Add service description here
 */

const SYMPHONY_SERVICE_TOPIC = 'symphonyService'
const FINSEMBLE_SYMPHONY_APP_TOKEN_ROOT_CONFIG_PATH = 'finsemble.custom.symphony.appTokenRoot'
const FINSEMBLE_SYMPHONY_DEFAULT_USERNAME_CONFIG_PATH = 'finsemble.custom.symphony.defaultUsername'

class SymphonyService extends Finsemble.baseService {
	/**
	 * Initializes a new instance of the SymphonyService class.
	 */

	constructor() {
		super({
			// Declare any service or client dependencies that must be available before your service starts up.
			startupDependencies: {
				// When ever you use a client API with in the service, it should be listed as a client startup
				// dependency. Any clients listed as a dependency must be initialized at the top of this file for your
				// service to startup.
				clients: [
					// "authenticationClient",
					// "configClient",
					// "dialogManager",
					// "distributedStoreClient",
					// "dragAndDropClient",
					// "hotkeyClient",
					// "launcherClient",
					// "linkerClient",
					// "searchClient
					// "storageClient",
					// "windowClient",
					// "workspaceClient",
				]
			}
		});

		this.symphonyUsername = ''
		this.symphonyUserInfo = {}
		this.symphonyApiPaths = {}
		// The config path to retrieve config form manifest

		this.symphonyAppRoot = ''
		this.symphonyUserSessionToken = ''
		this.readyHandler = this.readyHandler.bind(this);
		this.setupConnectionLifecycleChecks = this.setupConnectionLifecycleChecks.bind(this);
		this.onBaseServiceReady(this.readyHandler);
	}

	/**
	 * Fired when the service is ready for initialization
	 * @param {function} callback
	 */
	readyHandler(callback) {
		this.createRouterEndpoints();
		this.retrieveRootConfig();
		this.setupConnectionLifecycleChecks();

		Finsemble.Clients.Logger.log("Symphony Service ready");
		callback();
	}

	//-----------------------------------------------------------------------------------------
    // Functions related to Bloomberg connection status
    // Used to enable/disable calls to send context to launchpad automatically
    //-----------------------------------------------------------------------------------------
    setupConnectionLifecycleChecks = () => { 

		//setup pubsub topic if it doesn't already exist
		Finsemble.Clients.RouterClient.addPubSubResponder("SymphonyServiceConnectedToBloomberg", { "connected": false }, null, (err,response) => {
			if (err) {
			  console.error("Error when creating the Bloomberg connection state PubSub, it may already exist", err);
			} else {
			  console.log("Created Bloomberg connection state PubSub");
			}
		});
		
			
        //do the initial check
        this.checkConnection();
        //listen for connection events (listen/transmit)
        bbg.setConnectionEventListener(this.checkConnection);
        //its also possible to poll for connection status,
        //  worth doing in case the bridge process is killed off and doesn't get a chance to send an update
        setInterval(this.checkConnection, 30000);
    };

    checkConnection = () => {
        bbg.checkConnection((err, resp) => { 
            if (!err && resp === true) {
                connectedToBbg = true;
            } else if (err) {
                Finsemble.Clients.Logger.warn("Error received when checking connection", err);
                connectedToBbg = false;
            } else {
                Finsemble.Clients.Logger.debug("Negative response when checking connection: ", resp);
                connectedToBbg = false;
            }
			Finsemble.Clients.RouterClient.publish("SymphonyServiceConnectedToBloomberg", { "connected": connectedToBbg });
			console.log("Updated Bloomberg connection state: " + connectedToBbg);
			Finsemble.Clients.Logger.log("Updated Bloomberg connection state: " + connectedToBbg);
        });
    };

	retrieveRootConfig() {
		Finsemble.Clients.ConfigClient.getValues([FINSEMBLE_SYMPHONY_APP_TOKEN_ROOT_CONFIG_PATH, FINSEMBLE_SYMPHONY_DEFAULT_USERNAME_CONFIG_PATH], (err, configRes) => {
			if (!err) {
				this.symphonyAppRoot = configRes[FINSEMBLE_SYMPHONY_APP_TOKEN_ROOT_CONFIG_PATH]
				// Your Symphony API URL
				this.symphonyApiPaths = {
					// This API endpoint must be protected by your server using authentication (session/key)
					// Only the particular user can get his own Symphony user session
					getSymphonyUserSessionToken: this.symphonyAppRoot + '/getSymphonyUserSessionToken',
					listUserStreams: this.symphonyAppRoot + '/listUserStreams',
					usersLookup: this.symphonyAppRoot + '/usersLookup',
					sessionUser: this.symphonyAppRoot + '/sessionUser',
					createMessage: this.symphonyAppRoot + '/createMessage',
					searchUsers: this.symphonyAppRoot + '/searchUsers',
					createIM: this.symphonyAppRoot + '/createIM',
					listConnections: this.symphonyAppRoot + '/listConnections',
					createRoom: this.symphonyAppRoot + '/createRoom',
					addMember: this.symphonyAppRoot + '/addMember',
					share: this.symphonyAppRoot + '/share',
					createConnection: this.symphonyAppRoot + '/createConnection'
				}

				// The symphony username should be retireved from your auth system
				// For demo or testing purpose the symphony username is hardcoded below / in manifest
				// For testing, input your testing Symphony username below or in manifest $symphonyDefaultUsername
				// Your can send message on behalf of someone in youe pod. Please use it carefully.
				Finsemble.Clients.AuthenticationClient.getCurrentCredentials((err, authRes) => {
					if (!err) {
						if (authRes) {
							if (authRes.symphonyUsername) {
								// Retrieve from getCurrentCredentials()
								this.symphonyUsername = authRes.symphonyUsername
								Finsemble.Clients.Logger.log('Getting Symphony Username from CurrentCredentials')
							} else {
								this.symphonyUsername = configRes[FINSEMBLE_SYMPHONY_DEFAULT_USERNAME_CONFIG_PATH]
								Finsemble.Clients.Logger.log('Getting Symphony Username from Manifest')
							}
						} else if (configRes[FINSEMBLE_SYMPHONY_DEFAULT_USERNAME_CONFIG_PATH]) {
							// Retrieve Symphony username from  the Finsemble configuration
							// Note: The default username being specified in the manifest is an unrealistic usecase
							// however, it does make sense to load the symphony username into Finsemble config during auth
							this.symphonyUsername = configRes[FINSEMBLE_SYMPHONY_DEFAULT_USERNAME_CONFIG_PATH]
							Finsemble.Clients.Logger.log('Getting Symphony Username from Manifest')
						} else {
							// Hardcoded here in service, only for development / testing
							this.symphonyUsername = ''
							Finsemble.Clients.Logger.log('Getting Symphony Username from service code')
						}

						// Retrieve the Symphony User Session Token
						if (this.symphonyUsername != '') {
							this.getSymphonyUserSessionToken()
								.then((token) => {
									this.symphonyUserSessionToken = token.userSessionToken
									// Retrieve session userId 
									this.sessionUser(this.symphonyUserSessionToken)
										.then((userInfo) => {
											this.symphonyUserInfo = userInfo
										})
								})
								.catch((err) => {
									Finsemble.Clients.Logger.error('Failed to retrieve Symphony user session', err)
								})
						} else {
							Finsemble.Clients.Logger.error('Failed to retrieve Symphony user session without a Symphony username.')
						}
					}
				})
			}
		})
	}

	/**
	 * Creates a router endpoint for you service.
	 * Add query responders, listeners or pub/sub topic as appropriate.
	 */
	createRouterEndpoints() {
		var self = this;

		// Create router listener for "open-symphony-shared-chart"
		Finsemble.Clients.RouterClient.addListener("open-symphony-shared-chart", (err, res) => {
			if (err) {
				Finsemble.Clients.Logger.error(err)
			} else {
				let spawnParams = {
					data: {
						chart: res.data.actionPayload.chart
					}
				}
				Finsemble.Clients.LauncherClient.spawn("Advanced Chart", spawnParams);
			}
		});

		// Create router pub/sub responder for symphonyPublish
		Finsemble.Clients.RouterClient.addPubSubResponder("symphonyPublish", {
			"State": "start"
		});

		Finsemble.Clients.RouterClient.addListener("SymphonyRfqTransmit", (error, response) => {
			if (error) {
				Logger.system.error("SymphonyRfqTransmit Error: " + JSON.stringify(error));
			} else {
				let data = response.data;
				switch (data.action) {
					case 'spawn':
						let params = {
							data: {
								symbol: data.data.symbol
							}
						}
						Finsemble.Clients.LauncherClient.spawn(data.target, params)
						break;
					case 'createOrder':
						Finsemble.Clients.RouterClient.transmit('SymphonyRfqAddOrder', {
							rfq: data.data
						})
						break;
					case 'DES':
						bbg.runBBGCommand("DES", [data.data.symbol], "1", "", (err, response) => {
							if (err) {
								Finsemble.Clients.Logger.error("DES returned an error", err);
							} else if (!response.status) {
								Finsemble.Clients.Logger.error("DES returned a negative status", response);
							}
						});
					
						break;
					case 'Launchpad':
						bbg.runGetAllGroups((err, response) => {
							if (response && response.groups && Array.isArray(response.groups)) {
								Finsemble.Clients.Logger.log(`Setting context '${data.data.symbol}' on launchpad groups: `, response.groups);
								//cycle through all launchpad groups
								response.groups.forEach(group => {
									//TODO: may want to check group.type and only apply to type == security groups
									//Set group's context
										//N.b. this is replying on Bloomberg to resolve the name to a valid Bloomberg security string (e.g. TSLA = TSLA US Equity)
									 bbg.runSetGroupContext(group.name, data.data.symbol, null, (err, data) => {
										if (err) {
											Finsemble.Clients.Logger.error(`Error received from runSetGroupContext, group: ${group.name}, value: ${data.data.symbol}, error: `, err);
										}
									});
								});
							} else if (err) {
								Finsemble.Clients.Logger.error("Error received from runGetAllGroups:", err);
							} else {
								Finsemble.Clients.Logger.error("invalid response from runGetAllGroups", response);
							}
						});
					

						break;
					default:
						break;

				}
			}
		});

		// Protocol handler example which sending protocol event from ExtensionApp
		// e.g. fsbl://custom/SymphonyExtension/rfq?target=SymphonyTester&testData=AAPL
		Finsemble.System.addEventListener("protocol-handler-triggered", (data) => {
			if (data.url) {
				let protocolURL = new URL(data.url)
				let params = protocolURL.searchParams;
				let target = ''
				let symbol = ''
				for (let pair of params.entries()) {
					switch (pair[0]) {
						case 'target':
							target = pair[1]
							break;
						case 'symbol':
							symbol = pair[1]
							break
						case 'testData':
							symbol = pair[1]
							break
						default:
							break;
					}
				}
				if (target != '') {
					// Search for existing target component
					self.findAnInstance(target)
						.then((windowsIdentifiers) => {
							if (windowsIdentifiers.length > 0) {
								// Target conmponent exist, transmit a message
								Finsemble.Clients.RouterClient.transmit('symphonyTransmit', {
									symbol: symbol
								})
							} else {
								// No target found hence spawn / show 1 with spawn data
								Finsemble.Clients.LauncherClient.showWindow({
									componentType: target
								}, {
									spawnIfNotFound: true,
									addToWorkspace: true,
									position: "available",
									top: "center",
									left: "center",
									data: {
										symbol: symbol
									}
								}, (err, windowIdentifer) => {
									if (!err) {
										console.log(windowIdentifer)
									} else {
										console.log(err)
									}
								})
							}
						})
				}
			}
		})

		// Create query responder for components to use when working with the service
		Finsemble.Clients.RouterClient.addResponder(SYMPHONY_SERVICE_TOPIC, (err, queryMessage) => {
			if (err) {
				Finsemble.Clients.Logger.error("Failed to receive Symphony Service query", err);
			} else {
				let queryData = queryMessage.data
				let queryFunction = queryData.function
				switch (queryFunction) {
					case 'getSymphonyUserStreamList':
						let streamTypes = queryData.streamTypes
						self.listUserStreams(self.symphonyUserSessionToken, streamTypes)
							.then((userStreamList) => {
								queryMessage.sendQueryResponse(null, {
									userStreamList: userStreamList
								});
							})
							.catch(err => {
								Finsemble.Clients.Logger.error("Failed to list user stream", err);
								queryMessage.sendQueryResponse(err);
							});
						break;
					case 'getSymphonyUserStreamInfo':
						self.getSymphonyUserStreamInfo(self.symphonyUserSessionToken)
							.then((userStreamList) => {
								queryMessage.sendQueryResponse(null, {
									userStreamList: userStreamList
								});
							})
						break;
					case 'usersLookup':
						let userId = queryData.userId
						self.usersLookup(self.symphonyUserSessionToken, userId)
							.then((memberInfo) => {
								queryMessage.sendQueryResponse(null, {
									memberInfo: memberInfo
								});
							})
						break;
					case 'createMessage':
						let sid = queryData.sid
						let msg = queryData.msg
						self.createMessage(self.symphonyUserSessionToken, sid, msg)
							.then((result) => {
								queryMessage.sendQueryResponse(null, {
									result: result
								});
							})
						break;
					case 'searchUsers':
						let query = queryData.query
						let local = queryData.local
						self.searchUsers(self.symphonyUserSessionToken, query, local)
							.then((users) => {
								queryMessage.sendQueryResponse(null, {
									users: users
								});
							})
						break;
					case 'createIM':
						let userIDs = queryData.userIDs
						self.createIM(self.symphonyUserSessionToken, userIDs)
							.then((id) => {
								queryMessage.sendQueryResponse(null, {
									id: id
								});
							})
						break;
					case 'createRoom':
						let roomUserIDs = queryData.userIDs
						let chatroomName = queryData.chatroomName
						self.createRoom(self.symphonyUserSessionToken, chatroomName)
							.then((room) => {
								roomUserIDs.forEach(roomUserID => {
									self.addMember(self.symphonyUserSessionToken, room.room.roomSystemInfo.id, roomUserID)
								})

								queryMessage.sendQueryResponse(null, room);
							})
						break;
					case 'listConnections':
						let status = queryData.status
						let listConnectionsUserIDs = queryData.userIDs
						self.listConnections(self.symphonyUserSessionToken, status, listConnectionsUserIDs)
							.then((connections) => {
								queryMessage.sendQueryResponse(null, {
									connections: connections
								});
							})
						break;
					case 'share':
						let shareSid = queryData.sid
						let content = queryData.content
						self.share(self.symphonyUserSessionToken, shareSid, content)
							.then((result) => {
								queryMessage.sendQueryResponse(null, result);
							})
						break;
					case 'advSearchUsers':
						let advSearchQuery = queryData.query
						let advSearchLocal = queryData.local
						let advSearchLocalStatus = 'PENDING_OUTGOING'
						self.searchUsers(self.symphonyUserSessionToken, advSearchQuery, advSearchLocal)
							.then((users) => {
								self.listConnections(self.symphonyUserSessionToken, advSearchLocalStatus, "")
									.then((connections) => {
										queryMessage.sendQueryResponse(null, {
											users: users,
											connections: connections
										});
									})
							})
						break;

					case "getSymphonyUserInfo":
						queryMessage.sendQueryResponse(null, {
							symphonyUserInfo: self.symphonyUserInfo
						});
						break;
					case 'createConnection':
						let createConnectionUserId = queryData.userId
						self.createConnection(self.symphonyUserSessionToken, createConnectionUserId)
							.then((result) => {
								queryMessage.sendQueryResponse(null, result);
							})
						break;
					default:
						queryMessage.sendQueryResponse(null, 'Please specify symphony function');
						break;
				}
			}
		});
	}

	// IMPORTANT: This API must be protected by your server (i.e. userAuth session)
	getSymphonyUserSessionToken() {
		let apiName = 'getSymphonyUserSessionToken'
		let self = this
		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify({
						userName: self.symphonyUsername
					}),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else {
						Finsemble.Clients.Logger.error("Failed to retrieve Symphony User Session Token");
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data);
				})
				.catch(err => {
					Finsemble.Clients.Logger.error("Failed to retrieve Symphony User Session Token", err);
					reject(err)
				});
		})
	}
	// ---------------------------------------------------

	listUserStreams(userSessionToken, streamTypes) {
		let apiName = 'listUserStreams'
		let self = this
		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify({
						userSessionToken: userSessionToken,
						streamTypes: streamTypes
					}),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else if (res.status == 401) {
						Finsemble.Clients.Logger.error("Failed to list user stream - userSession invalid", res);
						self.getSymphonyUserSessionToken()
							.then((token) => {
								self.symphonyUserSessionToken = token.userSessionToken
								self.listUserStreams(token.userSessionToken)
									.then((userStreamList) => {
										resolve(userStreamList);
									})
							})
							.catch(err => {
								console.log(err)
								reject(err)
							});
					} else {
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data.userStreamList);
				})
				.catch(err => {
					console.log(err)
					reject(err)
				});
		})
	}

	usersLookup(userSessionToken, userId) {
		let apiName = 'usersLookup'
		let self = this
		userId = [...new Set(userId)];
		userId.splice(userId.indexOf(this.symphonyUserInfo.id), 1)
		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify({
						userSessionToken: userSessionToken,
						userId: userId.toString()
					}),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else if (res.status == 401) {
						Finsemble.Clients.Logger.error("Failed to list user stream - userSession invalid", res);
						self.getSymphonyUserSessionToken().then((token) => {
							self.symphonyUserSessionToken = token.userSessionToken
							self.usersLookup(token.userSessionToken, userId)
								.then((memberInfo) => {
									resolve(memberInfo);
								})
						})
					} else {
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data.memberInfo);
				})
				.catch(err => {
					reject(err)
				});
		})
	}

	sessionUser(userSessionToken) {
		let apiName = 'sessionUser'
		let self = this
		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify({
						userSessionToken: userSessionToken
					}),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else if (res.status == 401) {
						Finsemble.Clients.Logger.error("Failed to list user stream - userSession invalid", res);
						self.getSymphonyUserSessionToken().then((token) => {
							self.symphonyUserSessionToken = token.userSessionToken
							self.sessionUser(token.userSessionToken)
								.then((userInfo) => {
									resolve(userInfo);
								})
						})
					} else {
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data.userInfo);
				})
				.catch(err => {
					reject(err)
				});
		})
	}

	createMessage(userSessionToken, sid, msg) {
		let apiName = 'createMessage'
		msg = '<messageML>' + msg + '</messageML>'
		let self = this
		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify({
						userSessionToken: userSessionToken,
						sid: sid,
						msg: msg
					}),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else if (res.status == 401) {
						Finsemble.Clients.Logger.error("Failed to list user stream - userSession invalid", res);
						self.getSymphonyUserSessionToken().then((token) => {
							self.symphonyUserSessionToken = token.userSessionToken
							self.createMessage(token.userSessionToken, sid, msg)
								.then((result) => {
									resolve(result);
								})
						})
					} else {
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data.result);
				})
				.catch(err => {
					reject(err)
				});
		})
	}

	searchUsers(userSessionToken, query, local) {
		let apiName = 'searchUsers'
		let self = this
		let body = {
			userSessionToken: userSessionToken,
			query: query
		}
		if (local) {
			body.local = local
		}

		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify(body),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else if (res.status == 401) {
						Finsemble.Clients.Logger.error("Failed to list user stream - userSession invalid", res);
						self.getSymphonyUserSessionToken().then((token) => {
							self.symphonyUserSessionToken = token.userSessionToken
							self.searchUsers(token.userSessionToken, query, local)
								.then((result) => {
									resolve(result);
								})
						})
					} else {
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data.users);
				})
				.catch(err => {
					reject(err)
				});
		})
	}

	createRoom(userSessionToken, chatroomName) {
		let apiName = 'createRoom'
		let self = this
		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify({
						userSessionToken: userSessionToken,
						chatroomName: chatroomName
					}),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else if (res.status == 401) {
						Finsemble.Clients.Logger.error("Failed to list user stream - userSession invalid", res);
						self.getSymphonyUserSessionToken().then((token) => {
							self.symphonyUserSessionToken = token.userSessionToken
							self.createRoom(token.userSessionToken, userIDs, chatroomName)
								.then((result) => {
									resolve(result);
								})
						})
					} else {
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data);
				})
				.catch(err => {
					reject(err)
				});
		})
	}

	addMember(userSessionToken, streamId, userId) {
		let apiName = 'addMember'
		let self = this
		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify({
						userSessionToken: userSessionToken,
						streamId: streamId,
						userId: userId
					}),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else if (res.status == 401) {
						Finsemble.Clients.Logger.error("Failed to list user stream - userSession invalid", res);
						self.getSymphonyUserSessionToken().then((token) => {
							self.symphonyUserSessionToken = token.userSessionToken
							self.createRoom(token.userSessionToken, userIDs, chatroomName)
								.then((result) => {
									resolve(result);
								})
						})
					} else {
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data);
				})
				.catch(err => {
					reject(err)
				});
		})
	}

	createIM(userSessionToken, userIDs) {
		let apiName = 'createIM'
		let self = this
		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify({
						userSessionToken: userSessionToken,
						userIDs: userIDs
					}),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else if (res.status == 401) {
						Finsemble.Clients.Logger.error("Failed to list user stream - userSession invalid", res);
						self.getSymphonyUserSessionToken().then((token) => {
							self.symphonyUserSessionToken = token.userSessionToken
							self.createIM(token.userSessionToken, userIDs)
								.then((result) => {
									resolve(result);
								})
						})
					} else {
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data.id);
				})
				.catch(err => {
					reject(err)
				});
		})
	}

	share(userSessionToken, sid, content) {
		let apiName = 'share'
		let self = this
		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify({
						userSessionToken: userSessionToken,
						sid: sid,
						content: content
					}),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else if (res.status == 401) {
						Finsemble.Clients.Logger.error("Failed to list user stream - userSession invalid", res);
						self.getSymphonyUserSessionToken().then((token) => {
							self.symphonyUserSessionToken = token.userSessionToken
							self.share(token.userSessionToken, sid, content)
								.then((result) => {
									resolve(result);
								})
						})
					} else {
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data);
				})
				.catch(err => {
					reject(err)
				});
		})
	}

	listConnections(userSessionToken, status, userIDs) {
		let apiName = 'listConnections'
		let self = this
		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify({
						userSessionToken: userSessionToken,
						status: status,
						userIDs: userIDs
					}),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else if (res.status == 401) {
						Finsemble.Clients.Logger.error("Failed to list user stream - userSession invalid", res);
						self.getSymphonyUserSessionToken().then((token) => {
							self.symphonyUserSessionToken = token.userSessionToken
							self.listConnections(token.userSessionToken, status, userIDs)
								.then((result) => {
									resolve(result);
								})
						})
					} else {
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data.connections);
				})
				.catch(err => {
					reject(err)
				});
		})
	}

	createConnection(userSessionToken, userId){
		let apiName = 'createConnection'
		let self = this
		return new Promise((resolve, reject) => {
			fetch(self.symphonyApiPaths[apiName], {
					method: "POST",
					body: JSON.stringify({
						userSessionToken: userSessionToken,
						userId: userId
					}),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(res => {
					if (res.status == 200) {
						return res.json()
					} else if (res.status == 401) {
						Finsemble.Clients.Logger.error("Failed to list user stream - userSession invalid", res);
						self.getSymphonyUserSessionToken().then((token) => {
							self.symphonyUserSessionToken = token.userSessionToken
							self.createConnection(token.userSessionToken, userId)
								.then((result) => {
									resolve(result);
								})
						})
					} else {
						reject(res.status)
					}
				})
				.then(data => {
					resolve(data);
				})
				.catch(err => {
					reject(err)
				});
		})
	}

	async findAnInstance(componentType) {
		let {
			err,
			data
		} = await Finsemble.Clients.LauncherClient.getActiveDescriptors();
		if (err) {
			console.error(err);
			return Promise.reject(err);
		} else {
			let windowIdentifiers = [];
			Object.keys(data).forEach(windowName => {
				if (data[windowName].componentType == componentType) {
					windowIdentifiers.push({
						componentType: componentType,
						windowName: windowName
					});
				}
			});
			return Promise.resolve(windowIdentifiers);
		}
	}
}

const serviceInstance = new SymphonyService();

serviceInstance.start();
module.exports = serviceInstance;