console.log('mindcontrol - symphony');

function readyFn () {
	if (!window.removeFinsembleLoadingScrim) {
		return setTimeout(readyFn, 250);
	}
	FSBL.$ = require('./jQuery.js');
	FSBL.alertify = require('./alertify.js');

	// Style Overrides
	FSBL.$(document.body).append('<style>'+require('./symphony.css')+'</style>');

	var Symphony = window.require ? window.require("symphony-core") : null;
	//var console = new FSBL.Utils.Console('Symphony');

	FSBL.Clients.DistributedStoreClient.createStore({
		store: "Symphony", global: true, values: {
			'primarySymphonyWindow': FSBL.Clients.WindowClient.windowName
		}
	}, function (err, globalStore) {

		// Sign On
		var signOnKey = 'symphony';
		function signon(signOnData) {
			console.log("signonData", signOnData);
			if (signOnData) {

				FSBL.$("input[name='signin-email']").val(signOnData.username);
				FSBL.$("input[name='signin-password']").val(signOnData.password);
				FSBL.Clients.WindowClient.setComponentState({ field: 'loginRequested', value: { activeLogin: true, validationRequired: signOnData.validationRequired } }, function () {
					FSBL.$("button[name='signin-submit']").trigger('click');
					setTimeout(function () {
						checkIfSignonNeeded(function () { })
					}, 1000);
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

		// am I on a login page?
		function checkIfSignonNeeded(cb) {
			console.log('check if signon needed');

			function doStuffAfterLoggingIn(cb) {
				return cb(false);
			}

			// check if we are the primary window
			globalStore.getValue({ field: 'primarySymphonyWindow' }, function (err, value) {
				if (value == null) {
					FSBL.Clients.Logger.log("Assuming primarySymphonyWindow. Some other window login must have failed.");
					value = FSBL.Clients.WindowClient.windowName;
					globalStore.setValue({ field: "primarySymphonyWindow", value: value }, function (err, value) {});
				}
				if (value == FSBL.Clients.WindowClient.windowName) { //If we are the main Window then login
					console.log('in primary window');
					var buttonToClick;

					if (FSBL.$('.undefined.tempo-btn.tempo-btn--primary').text() === 'Login') {
						buttonToClick = FSBL.$('.undefined.tempo-btn.tempo-btn--primary');
					}

					if (FSBL.$('.tempo-btn.tempo-btn--flat').text() === 'Sign in to chat') {
						buttonToClick = FSBL.$('.tempo-btn.tempo-btn--flat')
					}

					// If we are at one of the useless button pages, click to continue
					if (buttonToClick) {
						console.log('found button to click');
						buttonToClick.trigger('click')
						return cb(true);
					}

					// Has symphony loaded anything? If not, wait
					if (!FSBL.$('#nav').text().length && !FSBL.$('#root').length && !FSBL.$('#authentication').length && !buttonToClick) {
						console.log('nothing found on page');
						return setTimeout(function () {
							checkIfSignonNeeded(cb)
						}, 150);
					}

					// Do we need to login?
					console.log('checking if auth needed');
					if (FSBL.$('#authentication').length) {
						console.log('auth needed');
						var podURL = window.location.protocol + "//" + window.location.host;
						params = {
							icon: podURL + '/images/svg/logo.svg',
							prompt: 'Symphony Login'
						};

						FSBL.Clients.WindowClient.getComponentState({ field: 'loginRequested' }, function (err, state) {
							// bad password
							if (FSBL.$('.fail.show').text().includes('Invalid username or password')) {

								FSBL.Clients.WindowClient.getComponentState({ field: 'loginRequested' }, function (err, state) {
									if (state.validationRequired) {
										console.log("failed login: ", FSBL.$('.fail.show').text());
										FSBL.Clients.AuthenticationClient.appRejectAndRetrySignOn(signOnKey, { userMsg: FSBL.$('.fail.show').text() }, function (err, signOnData) {
											signon(signOnData);
										});
									} else {
										let forceParams = Object.assign({}, params); //clone
										forceParams.force = true;
										// force a signon problem because previously accepted data wasn't successful
										FSBL.Clients.AuthenticationClient.appSignOn(signOnKey, forceParams, function (err, signOnData) {
											signon(signOnData);
										});
									}
								});
							} else {
								FSBL.Clients.AuthenticationClient.appSignOn(signOnKey, params, function (err, signOnData) {
									signon(signOnData);
								});
							}
						});

						return cb(true);
					} else {
						console.log('auth not needed');
						// we are signed on, hurray
						FSBL.Clients.RouterClient.publish('Finsemble.SymphonySignedOn', true);
						doStuffAfterLoggingIn(cb);
					}

				} else { //otherwise just wait for the main window and reload
					console.log('not the main window');
					FSBL.Clients.RouterClient.subscribe('Finsemble.SymphonySignedOn', function (err, response) {
						console.log('main window logged in');
						if (response.data === true) {
							if (FSBL.$('.undefined.tempo-btn.tempo-btn--primary').text() === 'Login') {
								buttonToClick = FSBL.$('.undefined.tempo-btn.tempo-btn--primary');
							}

							if (FSBL.$('.tempo-btn.tempo-btn--flat').text() === 'Sign in to chat') {
								buttonToClick = FSBL.$('.tempo-btn.tempo-btn--flat')
							}

							// If we are at one of the useless button pages, click to continue
							if (buttonToClick) {
								buttonToClick.trigger('click')
								return cb(true);
							} else if (FSBL.$('#authentication').length) {
								location.reload();
							}

							doStuffAfterLoggingIn(cb);
						}
					})
				}
			})

		}

		function launchIfNeeded(chatDescriptor) {
			chatDescriptor.fromUser = Symphony.Application.getDataStore()["resources"].users.models[0].attributes
			chatDescriptor.chatId = chatDescriptor.userID ? chatDescriptor.userID : chatDescriptor.viewID;

			// Update a linked chat window or create a new one for this user if no linked chat window exists
			FSBL.Clients.DragAndDropClient.openSharedData({
				data: {
					"symphony.chat": {
						chatDescriptor: chatDescriptor
					}
				}
			});
		}

		FSBL.Clients.WindowClient.setWindowTitle("Symphony");
		// Custom styles to hide everything except navigation

		checkIfSignonNeeded(function (signOnNeeded) {
			if (!signOnNeeded) {
				function removeScrim() {
					if (FSBL.$('.navigation-item').length && FSBL.$('.navigation-item').text().length) {
						return window.removeFinsembleLoadingScrim();
					}
					setTimeout(removeScrim, 250);
				}
				removeScrim()
			}
		})

		// prevent multiple clicks
		var lastClicked;
		function setLastClicked(text) {
			lastClicked = text;
			setTimeout(function () {
				lastClicked = '';
			}, 3000);
		}

		function navClickHandler(nameDiv) {
			var text = nameDiv.text();
			if (lastClicked === text) {
				return;
			} else {
				setLastClicked(text);
			}
			// Wait for the chat window to load, once loaded, spawn a new chat window with the chat Id and Header

			function waitForChat() {
				var chatLoaded = false;
				var chatTitles = FSBL.$('.truncate-text');
				if (!chatTitles.length) chatTitles = FSBL.$('.chat-room-header__name');
				//debugger;
				console.log("CHAT TITLES", chatTitles);
				chatTitles.each(function (key, value) {
					var chatHeader = FSBL.$(value);
					if (chatHeader.text().trim() === text) {
						chatLoaded = true;
						var chatDescriptor = {
							header: text
						};

						chatDescriptor.userID = chatHeader.attr('data-userid');
						if (!chatDescriptor.userID) {
							chatDescriptor.viewID = chatHeader.closest('[data-viewid]').attr('data-viewid').split("chatroom")[1];
						}
						launchIfNeeded(chatDescriptor);
						return false;
					}
				});
				if (!chatLoaded) {
					return setTimeout(waitForChat, 250);
				}

			}
			waitForChat();
		}

		// Catch navigation clicks - this is needed to catch clicks on the entire div as opposed to just the name
		FSBL.$(document).on('click', '.navigation-item', function (event) {
			var nameDiv = $(this).find('.navigation-item-name').trigger('click');
			event.preventDefault();
			event.stopPropagation();
			navClickHandler(nameDiv);
			return false;
		});

	})
}

FSBL.addEventListener('onReady', function () {
	if (window.mindControl) {
		console.warn('Duplicate Injection');
		return;
	}
	// Sometimes symphony scrolls the page when clicking on a user, causing the FSBL header to become inoperable (hidden underneath the body)
	// This logic detects such scroll events and snaps back to unscrolled.
	window.onscroll = function () {
		var scroll = $(document).scrollTop();
		if (scroll!==0) {
			window.scrollTo(0, 0);
		}
	};
	window.mindControl = true;
	readyFn();
});
