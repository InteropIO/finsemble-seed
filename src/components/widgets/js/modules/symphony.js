var symphonySettings;
var moduleList = {};
var intercom;
var windowGroup = PortalCore.urlParams.windowGroup;

if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

function getSymphonyOptions() {
	var options = {
		canFloat: true
	};
	var parentModuleId = localStorage.getItem('unpinnedWindow');
	if (parentModuleId) options.parentModuleId = parentModuleId;
	return options;
}

function addWindow(moduleId) {
	localStorage.setItem('unpinnedWindow', moduleId);
	moduleList[moduleId] = {};
}

function onSymphonyHello(data) {

	if (symphonySettings.controller) {
		symphonySettings.service = SYMPHONY.services.register(symphonySettings.bundleControllerId);
		SYMPHONY
			.application
			.register(symphonySettings.bundleId, ["ui", "modules", "applications-nav", "share"], [symphonySettings.bundleControllerId])
			.then(onSymphonyRegister)
			.catch(function (err) {
				console.error(err);
			});
	} else {
		//symphonySettings.service = SYMPHONY.services.subscribe(symphonySettings.bundleControllerId);
		SYMPHONY
			.application
			.connect(symphonySettings.bundleId, ['ui', 'modules', 'share', symphonySettings.bundleControllerId], [symphonySettings.bundleModuleId])
			.then(onSymphonyConnect);
	}

}

function onSymphonyRegister(/*response*/) {

	windowList = [];
	var moduleName = {
		title: symphonySettings.title,
		label: symphonySettings.label, // Displayed on-hover for triggers
		icon: symphonySettings.iconUrl
	};

	// System services
	//var userId = response.userReferenceId;
	var uiService = SYMPHONY.services.subscribe('ui');
	var navService = SYMPHONY.services.subscribe('applications-nav');
	var modulesService = SYMPHONY.services.subscribe('modules');
	var shareService = SYMPHONY.services.subscribe('share');
	shareService.handleLink("article", symphonySettings.bundleControllerId);

	// Add an entry to the left nav
	navService.add(
		symphonySettings.bundleId + '-nav',
		moduleName,
		symphonySettings.bundleControllerId
	);

	// Add a button to the hovercard that appears when hovering over cashtags
	moduleName.icon = symphonySettings.bigIconUrl;
	uiService.registerExtension('cashtag', symphonySettings.bundleId, symphonySettings.bundleControllerId, moduleName);

	moduleName.title = symphonySettings.title + (windowGroup ? ' (' + windowGroup + ')' : '');
	moduleName.icon = symphonySettings.iconUrl;

	try {
		// Implement some methods on our custom service. these will be invoked by user actions
		symphonySettings.service.implement({
			// This is run when the ChartIQ app link is clicked from the left sidebar
			select: function (/*navLinkId*/) {
				// Invoke the module service to show our own application in the grid
				var iFrameUrl = symphonySettings.iFrameUrl;
				var moduleId = symphonySettings.bundleId + (new Date()).getTime() + Math.random();
				if (iFrameUrl.includes('?')) iFrameUrl += '&moduleId=' + moduleId;
				else iFrameUrl += '?moduleId=' + moduleId;
				modulesService.show(moduleId, moduleName, symphonySettings.bundleControllerId, iFrameUrl, getSymphonyOptions());
				addWindow(moduleId);
				ga('symphonyTracker.send', 'event', 'chart', 'loaded', 'sidebar');

			},
			// This is run when a user clicks a cashtag link.
			trigger: function (type, id, data) {
				var name = data.entity.name.replace('$', '');

				// Update last-clicked cashtag in localStorage (what for?)
				localStorage.setItem('cashtag', name);

				// Open our app in the grid with the cashtag appended to the url params.
				var iFrameUrl = symphonySettings.iFrameUrl;
				if (iFrameUrl.includes('?')) iFrameUrl += '&sym=' + name;
				else iFrameUrl += '?sym=' + name;

				var moduleId = symphonySettings.bundleId + '-cashtag' + (new Date()).getTime() + Math.random();
				iFrameUrl += '&moduleId=' + moduleId;

				modulesService.show(moduleId, moduleName, symphonySettings.bundleControllerId, iFrameUrl, getSymphonyOptions());
				addWindow(moduleId);
				ga('symphonyTracker.send', 'event', 'chart', 'loaded', 'cashtag');
			},
			// This is run when a shared chart link is clicked
			link: function (type, data) {
				//var sharedInfo = JSON.parse(data);

				// Pre-show update of the localStorage config so
				// the chart knows what to draw when it loads.
				localStorage.setItem('sharedInfo', data);

				// Show the shared chart
				var iFrameUrl = symphonySettings.iFrameUrl;
				if (iFrameUrl.includes('?')) iFrameUrl += '&sharedInfo=true';
				else iFrameUrl += '?sharedInfo=true';

				var moduleId = symphonySettings.bundleId + '-share' + (new Date()).getTime() + Math.random();
				iFrameUrl += '&moduleId=' + moduleId;

				modulesService.show(moduleId, moduleName, symphonySettings.bundleControllerId, iFrameUrl, getSymphonyOptions());
				addWindow(moduleId);
				ga('symphonyTracker.send', 'event', 'chart', 'loaded', 'share');
			},
			// This is a way to communicate between windows??
			communicate: function (data) {
				debugger;
				/*_.each(moduleList, function (moduleData, moduleId) {
					try {
						if (data.moduleId != moduleId) {
							modulesService.hide(moduleId);
							modulesService.show(moduleId, moduleName, symphonySettings.bundleControllerId, "https://www.chartiq.com/", getSymphonyOptions());
						}
					} catch (e) {

					}
				})*/

			},
			loaded: function (data) {
				if (!moduleList[data.moduleId]) {
					addWindow(data.moduleId)
				}
			}
		});
	} catch (e) {
		console.error(e.stack);
	}

}

function onSymphonyConnect(response) {
	symphonySettings.service = SYMPHONY.services.subscribe(symphonySettings.bundleControllerId);
	if (!symphonySettings.service) {
		setTimeout(function () {
			SYMPHONY
				.application
				.connect(symphonySettings.bundleId, ['ui', 'modules', 'share', symphonySettings.bundleControllerId], [symphonySettings.bundleModuleId])
				.then(onSymphonyConnect);
		}, 1000);
		return;
	}

	// Makes sure this window gets into the list of windows to make new window opening consistent
	symphonySettings.service.invoke("loaded", { moduleId: PortalCore.urlParams.moduleId });

	// Subscribe to system services
	//var userId = response.userReferenceId;
	//var uiService = SYMPHONY.services.subscribe('ui');
	var shareService = SYMPHONY.services.subscribe("share");
	var modulesService = SYMPHONY.services.subscribe('modules');

	function updateTitle(err, quotes) {
		_.each(quotes, function (quote) {
			if (quote.Symbol == symphonySettings.symbol && quote.Last) {
				var arrow = '';


				var c;

				if (!quote.InstrumentType) c = parseFloat(quote.Change).toFixed(4);
				else c = parseFloat(quote.Change).toFixed(2);

				if (c > 0) arrow = '&#8593;';
				if (c < 0) arrow = '&#8595;';

				modulesService.setTitle(PortalCore.urlParams.moduleId, {
					title: quote.Symbol + ' ' + quote.Last + ' ' + arrow + c + (windowGroup ? ' (' + windowGroup + ')' : ''),
					icon: symphonySettings.iconUrl
				})
			}
		});
	}



	require(['modules/quote'], function () {
		if (symphonySettings.symbol) {
			//quoteSymbolList = _.union(quoteSymbolList, [symphonySettings.symbol]);
			dataSources[portalSettings.dataSource].fetchQuotes([symphonySettings.symbol], updateTitle, null);
			quoteSymbolList[symphonySettings.widgetId] = [symphonySettings.symbol];
			quoteDependencyList[symphonySettings.widgetId] = {
				quoteCallback: updateTitle,
				extraParams: symphonySettings.widgetId
			};
			updateQuote();
		}
	});


	// Takeover all links and route through symphony service
	/*$('document').on('click', 'a', function(e){

	});*/

	//create our own service
	PortalCore.ShareService.share = function (shareInfo) {
		console.log('sharing info');
		if (shareInfo.itemType == 'AdvancedChart') {
			var layout = shareInfo.data.layout;
			var drawings = shareInfo.data.drawings

			// solving the %20 problem for some customers
			if (drawings && drawings.length) {
				for(var i=0; i<drawings.length; i++) {
					if (drawings[i].text) drawings[i].text=unescape(drawings[i].text)
				}
			}

			var blurb = 'Chart Type:' + layout.chartType.replace('_', ' ');
			var prettyPeriod = '';

			if (layout.interval === 'day') {
				prettyPeriod = layout.periodicity + 'D';
			} else if (layout.interval === 'week') {
				prettyPeriod = layout.periodicity + 'W';
			} else if (layout.interval === 'month') {
				prettyPeriod = layout.periodicity + 'M';
			} else if (layout.interval === 'tick') {
				prettyPeriod = layout.periodicity + 'T';
			} else if (layout.interval * layout.periodicity >= 60) {
				prettyPeriod = ((layout.interval * layout.periodicity) / 60) + 'H';
			} else {
				prettyPeriod = (layout.interval * layout.periodicity) + 'm';
			}

			if (layout.studies) {
				var indicators = 'Indicators: ';
				var studyKeys = Object.keys(layout.studies);
				for (var i = 0; i < studyKeys.length; i++) {
					indicators += layout.studies[studyKeys[i]].type;
					if (i !== studyKeys.length - 1) {
						indicators += ', ';
					}
				}
				blurb += ' | ' + indicators;
			}

			if (layout.symbols && layout.symbols.length > 1) {
				var comparisons = "Compared to: ";
				for (var j = 0; j < layout.symbols.length; j++) {
					comparisons += layout.symbols[j].symbol;
					if (j !== layout.symbols.length - 1) {
						comparisons += ', ';
					}
				}
				blurb += ' | ' + comparisons;
			}

			var articleOptions = {
				title: layout.symbols[0].symbol.toUpperCase() + ' - ' + prettyPeriod,
				blurb: blurb,
				id: JSON.stringify(shareInfo),
				subTitle: "A chart has been shared with you.",
				publisher: "ChartIQ",
				thumbnail: symphonySettings.bigIconUrl
			};

			shareService.share("article", articleOptions)
		} else {
			console.log("Unsupported Widget")
		}
	};

	var moduleName = {
		title: symphonySettings.title + (windowGroup ? ' (' + windowGroup + ')' : ''),
		label: symphonySettings.label, // Displayed on-hover for triggers
		icon: symphonySettings.iconUrl
	};


	PortalCore.openSymphonyWindow = function (iFrameUrl, propagateGroup) {

		var unpinnedWindow = localStorage.getItem('unpinnedWindow');
		if (!unpinnedWindow && PortalCore.urlParams.moduleId) localStorage.setItem('unpinnedWindow', PortalCore.urlParams.moduleId);


		var moduleId = symphonySettings.bundleId + '-link' + (new Date()).getTime() + Math.random();
		if (iFrameUrl.includes('?')) iFrameUrl += '&moduleId=' + moduleId;
		else iFrameUrl += '?moduleId=' + moduleId;
		if (propagateGroup && windowGroup) {
			iFrameUrl += '&windowGroup=' + windowGroup;
		}
		modulesService.show(moduleId, moduleName, symphonySettings.bundleControllerId, iFrameUrl, getSymphonyOptions());
		addWindow(moduleId);
		ga('symphonyTracker.send', 'event', 'chart', 'loaded', 'newchartbutton');
	}

	//subscribe to the service we created in the controlle.js file
	//var controllerService = SYMPHONY.services.subscribe(symphonySettings.bundleControllerId);

	/*controllerService.listen('link', function () {
		setTimeout(function () {
			// opened from share

		});
	});
	controllerService.listen('trigger', function () {
		setTimeout(function () {
			// opened from cashtag

		});
	});

	controllerService.listen('communicate', function () {
		debugger;
		setTimeout(function () {
			debugger;
		});
	});*/

	shareService.handleLink("article", symphonySettings.bundleControllerId);

	var dragged = false;
	// Menu



	_.each(dependencies[symphonySettings.widgetId].items, function (dependency) {
		var navDiv = $('<div>').css('float', 'left').css('height', '100%').attr('id', symphonySettings.widgetId + '-menu').css('max-width', '30px');
		var navDiv2 = $('<div>');
		navDiv.append(navDiv2);
		var menu = $('<cq-menu>').addClass('ciq-menu collapse');
		menu.append($('<span>').append('<img src="' + (cssUrl.startsWith('http') ? cssUrl : '../' + cssUrl) + 'img/hamburger.svg">'));
		navDiv2.append(menu);
		var menuItems = $('<cq-menu-dropdown>').addClass('ps-container ps-theme-default');
		menu.append(menuItems);

		_.each(symphonySettings.navigation, function (navItem) {
			menuItems.append($('<cq-item>').append($('<div>').attr('onclick', navItem[1]).append(navItem[0])))
		});
		menuItems.append($('<cq-separator>'));

		var groups = ['A', 'B', 'C', 'D', 'E'];
		_.each(groups, function (group) {
			var menuItem = $('<cq-item>').attr('id', 'window-group-' + group).addClass('ciq-window-group');
			var groupChoice = $('<div>').attr('group', group);
			groupChoice.append('Group ' + group + ': <span class="ciq-radio"><span></span></span>');
			if (windowGroup && windowGroup == group) {
				menuItem.addClass('ciq-active');
			}
			menuItem.append(groupChoice);
			menuItems.append(menuItem);

		});


		menuItems.append($('<cq-separator>'));

		
		menuItems.append($('<cq-item>').append($('<div>').attr('onclick', "javascript:window.open('https://www.chartiq.com/wp-content/uploads/2017/04/SMPY_UserGuide.pdf')").append('User Guide')))
		menuItems.append($('<cq-separator>'));

		menuItems.append($('<cq-item>').append($('<div>').attr('onclick', "javascript:window.open('https://www.chartiq.com/')").append('<img src="https://widgetcdn.chartiq.com/img/chartiq-logo.png" style="height:25px">')))

		// this is required for the cq-menu click events to work
		var fakeDiv = $('<div>').append(navDiv);

		if (portalSettings.items[dependency].itemType == 'AdvancedChart') {
			var chartFrame = $('#ciq-' + dependency + '-chart')[0];
			var doc = $(chartFrame.contentDocument.body);
			$(doc.children('.ciq-nav')[0]).prepend(fakeDiv.html());
			$(chartFrame.contentDocument).on('click', '.ciq-window-group div', function (e) {
				var group = $(e.target).attr('group');
				if (!group) {
					var parent = $(e.target).parent();
					group = parent.attr('group');
					if (!group) {
						parent = parent.parent();
						group = parent.attr('group');
					}

				}
				windowGroup = group;
				modulesService.setTitle(PortalCore.urlParams.moduleId, {
					title: symphonySettings.title + ' (' + group + ')',
					icon: symphonySettings.iconUrl
				})
				$(chartFrame.contentDocument).find('.ciq-window-group').removeClass('ciq-active');
				$(chartFrame.contentDocument).find('#window-group-' + group).addClass('ciq-active');
			});

			// Ad
			var lastAdShownTime = localStorage.getItem('lastAdShownTime');
			if (!lastAdShownTime) lastAdShownTime = 0;
			if ((new Date()) - lastAdShownTime > 1000 * 60 * 60 * 24 * 14) {
				symphonySettings.containerObject.append('<div class="ciq-advertisement"><div class="ciq-close">X</div><div class="ciq-advertisement-body"><div class="ciq-advertisement-image"></div><div class="ciq-advertisement-text">To connect ChartIQ to your own market data feed, <a target="_blank" href="http://info.chartiq.com/symphony">click here</a> to contact us.</div></div></div>');
				symphonySettings.containerObject.css('position', 'absolute');
				symphonySettings.containerObject.offset({
					top: $(window).height() - 250,
					left: 30
				});
				symphonySettings.containerObject.show();
				symphonySettings.containerObject.width($('.ciq-advertisement').width());
				$('.ciq-close').click(function (e) {
					$(e.target).parent().css('display', 'none');
					localStorage.setItem('lastAdShownTime', new Date());
				})
				symphonySettings.containerObject.draggable({
					drag: function (event, ui) {
						dragged = true;
					}
				});
				var resizeScreen = function () {
					symphonySettings.containerObject.width($('.ciq-advertisement').width());
					if (!dragged) {
						var bottom;
						if ($('.ciq-footer').is(':visible')) bottom = $('.ciq-footer')
						else bottom = $('#ciq-bottom-finder')
						symphonySettings.containerObject.offset({
							top: bottom.offset().top - 225,
							left: 30
						});
					} else {
						if (symphonySettings.containerObject.offset().top + symphonySettings.containerObject.outerHeight() > $(window).height()) {
							symphonySettings.containerObject.offset({
								top: $(window).height() - symphonySettings.containerObject.outerHeight(),
								left: symphonySettings.containerObject.offset().left
							})
						}
						if (symphonySettings.containerObject.offset().left + symphonySettings.containerObject.outerWidth() > $(window).width()) {
							symphonySettings.containerObject.offset({
								top: symphonySettings.containerObject.offset().top,
								left: $(window).width() - symphonySettings.containerObject.outerWidth()
							})
						}
					}
				}
				PortalCore.ParentHeightChecker.PostResizeCalls.push(resizeScreen);
				PortalCore.PostResizeCalls.push(resizeScreen);

			}

		} else if (portalSettings.items[dependency].itemType == 'Search') {
			var widgetDiv = $('#ciq-' + dependency);
			widgetDiv.prepend(fakeDiv.html());
			$('cq-menu').on('click', function (e) {
				var target = $(this);
				if (target.hasClass('stxMenuActive')) {
					target.removeClass('stxMenuActive');
				} else {
					target.addClass('stxMenuActive');
				}
			});
			$('.ciq-window-group div').on('click', function (e) {
				var group = $(e.target).attr('group');
				if (!group) {
					var parent = $(e.target).parent();
					group = parent.attr('group');
					if (!group) {
						parent = parent.parent();
						group = parent.attr('group');
					}

				}
				windowGroup = group;
				modulesService.setTitle(PortalCore.urlParams.moduleId, {
					title: symphonySettings.title + ' (' + group + ')',
					icon: symphonySettings.iconUrl
				})
				$('.ciq-window-group').removeClass('ciq-active');
				$('#window-group-' + group).addClass('ciq-active');
			});
			$(document).click(function (e) {
				if (!($(e.target).is("cq-menu.stxMenuActive") || $(e.target).closest("cq-menu.stxMenuActive").length)) {
					$("cq-menu.stxMenuActive").removeClass('stxMenuActive')
				}

			});


		}
	});



}

function intercomMessage(data) {
	if (!windowGroup) return;
	if (symphonySettings.controller || PortalCore.urlParams.moduleId == data.moduleId || windowGroup != data.windowGroup) {
		return;
	}
	symphonySettings.symbol = data.symbol;
	var message = {
		sender: symphonySettings.widgetId,
		subject: 'symbolChange',
		data: {
			symbol: data.symbol
		}
	};
	PortalCore.sendMessage(message);
}



function symphony(list) {
	list = JSON.parse(list);
	if (!PortalCore.symphony) {
		ga('create', 'UA-30306856-11', 'auto', 'symphonyTracker');
		require(['https://www.symphony.com/resources/api/v1.0/symphony-api.js', 'jqueryui', 'https://cdnjs.cloudflare.com/ajax/libs/intercom.js/0.1.4/intercom.min.js'], function () {
			intercom = Intercom.getInstance();
			intercom.on('symbolChange', intercomMessage);
			_.each(list, function (widgetId) {
				symphonySettings = portalSettings.items[widgetId];
				symphonySettings.widgetId = widgetId;


				var container = 'ciq-' + widgetId;
				symphonySettings.containerObject = $('#' + container);
			});
			SYMPHONY
				.remote
				.hello()
				.then(onSymphonyHello)
				.catch(function (err) {
					console.error(err);
				});

			PortalCore.symphony = true;

			if (symphonySettings.message && symphonySettings.message.data && symphonySettings.message.data.symbol) {
				symphonySettings.symbol = symphonySettings.message.data.symbol;
			}

			if (symphonySettings.symbol) {
				ga('symphonyTracker.send', 'event', 'chart', 'load', symphonySettings.symbol);
			}

		})


	} else { // dependency call
		_.each(list, function (widgetId) {
			var settings = portalSettings.items[widgetId];
			if (settings.message && settings.message.data && settings.message.data.symbol) {
				settings.symbol = settings.message.data.symbol;
				symphonySettings.symbol = settings.symbol;
			}

			if (settings.symbol) {
				//symphonySettings.service.invoke("communicate", { symbol: settings.symbol, moduleId: PortalCore.urlParams.moduleId });

				ga('symphonyTracker.send', 'event', 'chart', 'symbolchange', settings.symbol);

				PortalCore.urlParams['sym'] = settings.symbol;
				history.replaceState(PortalCore.urlParams, "", location.pathname + "?" + $.param(PortalCore.urlParams));

				if (windowGroup) {
					intercom.emit('symbolChange', { symbol: settings.symbol, moduleId: PortalCore.urlParams.moduleId, windowGroup: windowGroup });
				}

				require(['modules/quote'], function () {
					if (symphonySettings.symbol) {
						//quoteSymbolList = _.union(quoteSymbolList, [symphonySettings.symbol]);
						quoteSymbolList[symphonySettings.widgetId] = [symphonySettings.symbol];
						/*quoteDependencyList[symphonySettings.widgetId] = {
							quoteCallback: updateTitle,
							extraParams: symphonySettings.widgetId
						};*/
						updateQuote();
					}
				});
			}
		});
	}
}