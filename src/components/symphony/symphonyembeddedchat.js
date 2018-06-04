
console.log('SymphonyChat MindControl: loaded');

FSBL.$ = require('./jQuery.js');
FSBL.alertify = require('./alertify.js');

if (location.href.includes('/client/index')) {
	location.href = location.href.replace('/client/', '/embed/')
}

FSBL.plugins = {
	sendData: function (data) {
		if (!FSBL.preloadPlugins) return;
		FSBL.preloadPlugins.forEach(function (e) {
			e.sendData(data);
		});
	},
	publish: function (chatDescriptor) {
		if (!FSBL.preloadPlugins) return;
		FSBL.preloadPlugins.forEach(function (e) {
			e.publish(chatDescriptor);
		});
	}
};

FSBL.preloadPlugins = [];

FSBL.addEventListener('onReady', function (event) {

	var componentConfig = FSBL.Clients.WindowClient.options.customData.component;
	var podURL = componentConfig.podURL;
	if (podURL.slice(-1) == "/") podURL = podURL.slice(0, -1); // trim off any trailing slashes
	let symphonyURL = podURL + "/client/index.html?embed&" + componentConfig.queryStringParams + "&";
	symphonyURL += "sdkOrigin=" + podURL + "&";
	var restURL = componentConfig.restURL;

	FSBL.Clients.Logger.system.info(`SymphonyChat MindControl: starting.`);

	FSBL.Clients.ConfigClient.getValue({ field: 'finsemble.applicationRoot' }, function (err, value) {
		FSBL.applicationRoot = value;
		if (!restURL) restURL = FSBL.applicationRoot;
	});

	if (window.mindControl) {
		console.warn('Duplicate Injection');
		return;
	}
	window.mindControl = true;

	if (location.href.includes(podURL)) {
		FSBL.Clients.WindowClient.injectHeader();
	}
	FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl: creating store.`, FSBL.Clients.WindowClient.windowName);
	FSBL.Clients.DistributedStoreClient.createStore({
		store: "Symphony", global: true, values: {
			'primarySymphonyWindow': FSBL.Clients.WindowClient.windowName
		}
	}, function (err, globalStore) {

		FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl: creating store response.`, err);

		// Style Overrides
		FSBL.$(document.body).append(`<style>
		.module.chat-module.single-party {
			height: calc(100vh - 32px);
		}
		</style>`);

		// Sign On
		var signOnKey = 'symphony';
		function signon(signOnData) {
			console.log("signonData", signOnData);
			if (signOnData) {

				FSBL.$("input[name='signin-email']").val(signOnData.username);
				FSBL.$("input[name='signin-password']").val(signOnData.password);
				FSBL.Clients.WindowClient.setComponentState({ field: 'loginRequested', value: { activeLogin: true, validationRequired: signOnData.validationRequired } }, function () {
					FSBL.$("button[name='signin-submit']").trigger('click');
					setTimeout(checkIfSignonNeeded(function (signOnNeeded) {

					}), 1000);
				});
			} else { // what to do if they close the sign on box?
				FSBL.Clients.Logger.error("Symphony unexpected condition. No signonData!");
				globalStore.getValue({ field: "primarySymphonyWindow" }, function (err, value) {
					if (value == FSBL.Clients.WindowClient.windowName) {
						FSBL.Clients.Logger.log("I'm a dead bug. Releasing myself from being primarySymphonyWindow");
						globalStore.setValue({ field: "primarySymphonyWindow", value: null }, function (err, value) {
							//FSBL.Clients.WindowClient.close();
						});
					}
				});
			}
		}

		function amSignedOn() {
			FSBL.Clients.WindowClient.getComponentState({ field: 'loginRequested' }, function (err, state) {
				if (state) {
					FSBL.Clients.AuthenticationClient.appAcceptSignOn(signOnKey);
					FSBL.Clients.WindowClient.setComponentState({ field: 'loginRequested', value: false });
				}
			});
		}

		function processSharedData(sharedData) {
			FSBL.Clients.DragAndDropClient.openSharedData({ data: sharedData });
		}

		function hijackEventDispatcher() {
			console.log('hijacking event dispatcher');
			document.addEventListener('click', function (e) {
				if (e.target.tagName == "SPAN" && e.target.parentElement.tagName == "A") {
					var link = e.target.parentElement.href;
					if (link.indexOf('finsemble//') !== -1) {
						e.stopPropagation();
						e.preventDefault();
						var data = link.split('finsemble//')[1];
						processSharedData(JSON.parse(decodeURIComponent(data)));
					}
				}
			}, true);

			document.addEventListener('dragstart', function (e) {
				console.log(e);
				if (e.target.tagName == "A") {
					var link = e.target.href;
					if (link.indexOf('finsemble//') !== -1) {
						var data = link.split('finsemble//')[1];
						data = JSON.parse(decodeURIComponent(data));
						FSBL.Clients.DragAndDropClient.dragStartWithData(e, data);
					}
				}
			}, true);

		}

		// am I on a login page?
		function checkIfSignonNeeded(cb) {
			console.log('check if signon needed');
			FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:checkIfSignonNeeded`);
			function doStuffAfterLoggingIn(cb) {
				hijackEventDispatcher();

				var removeScrim = function () {
					console.log('trying to remove scrim')
					if (window.removeFinsembleLoadingScrim) {
						FSBL.$('.spinnerContainer').remove();
						setTimeout(window.removeFinsembleLoadingScrim, 250);
					} else {
						setTimeout(removeScrim, 250);
					}
				}
				removeScrim();

				return cb(false);
			}

			// check if we are the primary window
			globalStore.getValue({ field: 'primarySymphonyWindow' }, function (err, value) {
				FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:globalStore.getValue primarySymphonyWindow`, (err, value));
				if (value == FSBL.Clients.WindowClient.windowName) { //If we are the main Window then login
					var buttonToClick;

					if (FSBL.$('.undefined.tempo-btn.tempo-btn--primary').text() === 'Login') {
						buttonToClick = FSBL.$('.undefined.tempo-btn.tempo-btn--primary');
					}

					if (FSBL.$('.tempo-btn.tempo-btn--flat').text() === 'Sign in to chat') {
						buttonToClick = FSBL.$('.tempo-btn.tempo-btn--flat');
					}

					// If we are at one of the useless button pages, click to continue
					if (buttonToClick) {
						buttonToClick.trigger('click');
						return cb(true);
					}

					// Has symphony loaded anything? If not, wait
					if (!FSBL.$('#root').length && !FSBL.$('#authentication').length) {
						setTimeout(function () {
							checkIfSignonNeeded(cb);
						}, 150);
						return;
					}

					// Do we need to login?
					if (FSBL.$('#authentication').length) {
						params = {
							icon: podURL + '/images/svg/logo.svg',
							prompt: 'Symphony Login'
						};

						FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:getComponentState 1`);
						FSBL.Clients.WindowClient.getComponentState({ field: 'loginRequested' }, function (err, state) {
							FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:getComponentState response 1`, err, state);
							// bad password
							if (FSBL.$('.fail.show').text().includes('Invalid username or password')) {

								FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:getComponentState 2`);
								FSBL.Clients.WindowClient.getComponentState({ field: 'loginRequested' }, function (err, state) {
									FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:getComponentState response 2`, err, state);
									if (state.validationRequired) {
										console.log("failed login: ", FSBL.$('.fail.show').text());
										FSBL.Clients.AuthenticationClient.appRejectAndRetrySignOn(signOnKey, { userMsg: FSBL.$('.fail.show').text() }, function (err, signOnData) {
											FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:signon response 1`, error, signOnData);
											signon(signOnData);
										});
									} else {
										let forceParams = Object.assign({}, params); //clone
										forceParams.force = true;
										// force a signon problem because previously accepted data wasn't successful
										FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:signon 1`, signOnKey);
										FSBL.Clients.AuthenticationClient.appSignOn(signOnKey, forceParams, function (err, signOnData) {
											FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:signon response 2`, error, signOnData);
											signon(signOnData);
										});
									}
								});
							} else {
								FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:signon 2`, signOnKey);
								FSBL.Clients.AuthenticationClient.appSignOn(signOnKey, params, function (err, signOnData) {
									FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:signon response 3`, err, signOnData);
									signon(signOnData);
								});
							}
						});

						return cb(true);
					} else {
						// we are signed on, hurray
						FSBL.Clients.RouterClient.publish('Finsemble.SymphonySignedOn', true);
						doStuffAfterLoggingIn(cb);

					}

				} else { //otherwise just wait for the main window and reload
					FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:wait for login notification on SymphonySignedOn`);
					FSBL.Clients.RouterClient.subscribe('Finsemble.SymphonySignedOn', function (err, response) {
						if (err) {
							FSBL.Clients.Logger.system.error(`SymphonyChat SymphonySignedOn: login error notification`, (err, response));
						} else if (response.data === true) {
							FSBL.Clients.Logger.system.debug(`SymphonyChat SymphonySignedOn: successful login notify received`, (err, response));
							if (FSBL.$('.undefined.tempo-btn.tempo-btn--primary').text() === 'Login') {
								buttonToClick = FSBL.$('.undefined.tempo-btn.tempo-btn--primary');
							}

							if (FSBL.$('.tempo-btn.tempo-btn--flat').text() === 'Sign in to chat') {
								buttonToClick = FSBL.$('.tempo-btn.tempo-btn--flat')
							}

							// If we are at one of the useless button pages, click to continue
							if (buttonToClick) {
								FSBL.Clients.Logger.system.debug(`Finsemble.SymphonySignedOn:buttonToClick`);
								buttonToClick.trigger('click')
								return cb(true);
							} else if (FSBL.$('#authentication').length) {
								changeChatLocation(FSBL.Clients.WindowClient.options.customData.chatInfo);
							} else {
								FSBL.Clients.Logger.system.debug(`Finsemble.SymphonySignedOn: all options skipped`);
							}

							doStuffAfterLoggingIn(cb);
						}
					});
				}
			})
		}

		/**
		 * Make a url safe streamID according to https://rest-api.symphony.com/docs/room-id
		 * @param {string} streamID the stream ID (room)
		 */
		function symphonyEncode(streamID) {
			function escapeRegExp(str) {
				return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
			}
			function replaceAll(str, find, replace) {
				return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
			}
			streamID = replaceAll(streamID, "+", "-");
			streamID = replaceAll(streamID, "/", "_");
			streamID = streamID.replace("==", "");
			return streamID;
		}
		/**
		 * Changes this window's location to display embedded chat for the requested chat information object
		 * @param {object} chatInfo That chat information object passed from the main Symphony component
		 */
		function changeChatLocation(chatInfo) {
			var additionalQueryString = chatInfo.userID ? 'module=im&userIds=' + chatInfo.userID : 'module=room&streamId=' + symphonyEncode(chatInfo.viewID);
			FSBL.Clients.Logger.system.debug(`Finsemble.SymphonySignedOn:reload`, additionalQueryString);
			location.href = symphonyURL + additionalQueryString;
		}

		FSBL.$(document.body).append('<style>'+require('./symphonyembeddedchat.css')+'</style>');


		// Get state at load time

		FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl: before getComponentState`);
		FSBL.Clients.WindowClient.getComponentState({ field: 'chatInfo' }, function (err, state) {
			FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:getComponentState`, state);
			if (state) { FSBL.Clients.WindowClient.options.customData.chatInfo = state; }
			// set state to be used at reload time
			FSBL.Clients.WindowClient.setComponentState({ field: 'chatInfo', value: FSBL.Clients.WindowClient.options.customData.chatInfo });
			if (FSBL.Clients.WindowClient.options.customData.chatInfo) {
				var chatDescriptor = FSBL.Clients.WindowClient.options.customData.chatInfo;
				var chatId = chatDescriptor.userID ? chatDescriptor.userID : chatDescriptor.viewID;
				//globalStore.setValue({ field: 'chats.' + chatId + '.' + FSBL.Clients.WindowClient.windowName, value: true });
				FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl X: before getGroups`);
				if (FSBL.Clients.LinkerClient.getGroups().groups.length && chatDescriptor.userID) {
					FSBL.plugins.publish(chatDescriptor);
				}
				if (chatDescriptor.header) {
					FSBL.Clients.WindowClient.setWindowTitle(chatDescriptor.header + " | Symphony");
				}
				if (location.href.includes(podURL)) {
					FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl X: before checkIfSignonNeeded`);
					checkIfSignonNeeded(function (signOnNeeded) { });
				} else {
					changeChatLocation(chatDescriptor);
				}
			}

			// Hijack the event dispatcher to catch finsemble// links

			function sendData(err, response) {
				if (response.shareMethod != FSBL.Clients.DragAndDropClient.SHARE_METHOD.DROP) {
					return;
				}
				var data = response.data;
				if (data['symphony.chat']) {
					delete data['symphony.chat'];
				}
				if (!Object.keys(data).length) return;

				var chatInfo = FSBL.Clients.WindowClient.options.customData.chatInfo;

				encodedMessage = encodeURIComponent(JSON.stringify(response.data));
				var url = new URL("https://finsemble//" + encodedMessage);
				messageKeys = Object.keys(response.data);
				var title = response.data[messageKeys[0]].description;
				for (var i = 1; i < messageKeys.length; i++) {
					title += ' and ' + response.data[messageKeys[i]].description;
				}
				var messageML = '<messageML><a href="' + url.href + '">' + title + '</a></messageML>';

				FSBL.$.ajax({
					url: restURL + '/sendSymphonyMessage',
					method: 'post',
					data: {
						senderId: chatInfo.fromUser.id,
						receiverId: chatInfo.userID,
						message: messageML
					}
				}).done(function (response) {
				})

				FSBL.plugins.sendData(data);
			}

			function _openChat(chatInfo) {
				FSBL.Clients.WindowClient.options.customData.chatInfo = chatInfo; // replace same window with a new user
				FSBL.Clients.WindowClient.setComponentState({ field: 'chatInfo', value: chatInfo }, function () {
					if (location.href.includes(podURL)) {
						checkIfSignonNeeded(function (signOnNeeded) {
							if (!signOnNeeded) {
								changeChatLocation(chatInfo);
							}
						})
					} else {
						changeChatLocation(chatInfo);
					}
				});
			}

			function openChat(err, response) {
				if (FSBL.Clients.WindowClient.options.customData.chatInfo) {
					var chatId = FSBL.Clients.WindowClient.options.customData.chatInfo.userID ? FSBL.Clients.WindowClient.options.customData.chatInfo.userID : FSBL.Clients.WindowClient.options.customData.chatInfo.viewID;
					globalStore.removeValue({ field: 'chats.' + chatId + '.' + FSBL.Clients.WindowClient.windowName });
				}

				var chatData = response.data['symphony.chat'].chatDescriptor;
				if (chatData.userName) { // this is for the salesforce connector
					chatData.fromUser = FSBL.Clients.WindowClient.options.customData.chatInfo.fromUser;
					// find User
					FSBL.$.ajax({
						url: restURL + '/getUserByName',
						method: 'POST',
						data: {
							senderId: FSBL.Clients.WindowClient.options.customData.chatInfo.fromUser.id,
							userName: chatData.userName
						}
					}).done(function (response) {
						chatData.userID = response.id;
						_openChat(chatData);

					})
				} else {
					_openChat(chatData);
				}
			}

			//FSBL.Clients.DragAndDropClient.openLinkerDataByDefault = false;
			console.log('Adding Receivers');
			FSBL.Clients.DragAndDropClient.addReceivers({
				receivers: [
					{
						type: /.*/,
						handler: sendData
					},
					{
						type: 'symphony.chat',
						handler: openChat
					}
				]
			});

			window.addEventListener("beforeunload", function (event) {
				FSBL.Clients.Logger.system.debug(`SymphonyChat MindControl:beforeunload`, event);
				var chatId = FSBL.Clients.WindowClient.options.customData.chatInfo.userID ? FSBL.Clients.WindowClient.options.customData.chatInfo.userID : FSBL.Clients.WindowClient.options.customData.chatInfo.viewID;
				globalStore.removeValue({ field: 'chats.' + chatId + '.' + FSBL.Clients.WindowClient.windowName });
			});

		});
	})
});
