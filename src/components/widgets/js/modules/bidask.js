/*
jQuery.noConflict();
(function ( $ ) {
	var jqGrabbingCursor=getComputedStyle(document.querySelectorAll(".cell")[0]).cursor+"bing";
	$(function() {
		$( "#sortable" ).sortable({cursor: jqGrabbingCursor, items: "li:not(.add)"});
		$( "#sortable" ).disableSelection();
		$( "body" ).on("mousedown",function(ev){ //keep keypad from popping up on touch devices
			$( ".cell.add input" ).blur();
		});
		$( ".cell.add input" ).on("mouseup touchend",function(ev){
			ev.target.focus(); //FF fix
		});
		$(window).on("message", function(e) {
		    newSymbol(e.originalEvent.data);
		});
	});
}(jQuery));*/

function bidaskClick(ev) {
    var widgetId = ev.currentTarget.id.replace('_cell', '');
    var message = {
        sender: widgetId,
        subject: 'symbolChange',
        data: {
            symbol: $(ev.currentTarget).attr('symbol')
        }
    }
    PortalCore.sendMessage(message);
}

function bidaskClose(ev) {
    debugger;
    var el = ev.target;
    while (!$(el).hasClass("cell")) {
        el = el.parentNode;
    }

    var widgetId = el.id.replace('_cell', '');
    var settings = defaultSettings.items[widgetId];
    var symbol = $(el).attr('symbol');
    el.parentNode.removeChild(el);

    for (var s = 0; s < settings.symbols.length; s++) {
        if (settings.symbols[s] == symbol) {
            settings.symbols.splice(s, 1);
            break;
        }
    }
    localStorage.setItem(widgetId, JSON.stringify(settings.symbols));
}

var bidaskDone = {};

var bidaskCallback = function (err, quoteData, list) {
    _.each(list, function (widgetId, key) {
        var containerId = 'ciq-' + widgetId;
        var settings = defaultSettings.items[widgetId];
        var containerObject = $('#' + containerId);

        var list = $('#' + containerId + '_sortable');
        list.html('');

        _.each(settings.symbols, function (symbol) {

            var quote = quoteData[symbol];
            if (!quote) quote = quoteData[symbol.replace("^", "")];
            if (quote && quote.Bid && quote.Ask) {
                if (!bidaskDone[widgetId] && dependencies[widgetId]) {
                    var message = {
                        sender: widgetId,
                        subject: 'symbolChange',
                        data: {
                            symbol: symbol
                        }
                    }
                    PortalCore.sendMessage(message);
                    bidaskDone[widgetId] = true;
                }
                var bid = quote.Bid;
                var ask = quote.Ask;
                var spread = ask - bid;
                if (quote.InstrumentType == "Currency") {
                    if (bid < 100 || ask < 100) {
                        bid = bid.toFixed(5);
                        ask = ask.toFixed(5);
                        spread = (spread * 10000).toFixed(1);
                    } else {
                        bid = bid.toFixed(3);
                        ask = ask.toFixed(3);
                        spread = (spread * 100).toFixed(1);
                    }
                } else {
                    bid = bid.toFixed(3);
                    ask = ask.toFixed(3);
                    spread = (spread * 100).toFixed(1);
                }
                var r = /([\.0-9]*)(\.?[0-9][0-9]|[0-9]\.[0-9])(\.?[0-9])/;
                var bidPieces = bid.match(r);
                var askPieces = ask.match(r);

                var item = $('<li>').addClass('cell list').attr('id', widgetId + '_cell').attr('symbol', symbol);
                item[0].onclick = bidaskClick;
                var table = $('<table>');
                table.append($('<tr>').addClass('symbol-area').append('<td colspan=2><span class="symbol">' + symbol + '</span><span class="close">x</span></td>'));
                var dataArea = $('<tr>').addClass('data-area');
                var leftArea = $('<table>');
                leftArea.append($('<tr>').addClass('bid-area').append('<td><span class="left">' + bidPieces[1] + '</span></td>'));
                leftArea.append($('<tr>').addClass('spread-area').append('<td><span>' + spread + '</span></td>'));
                leftArea.append($('<tr>').addClass('ask-area').append('<td><span class="left">' + askPieces[1] + '</span></td>'));
                var rightArea = $('<table>');
                rightArea.append($('<tr>').addClass('bid-area').append('<td><span class="large">' + bidPieces[2] + '</span><span class="small">' + bidPieces[3] + '</span></td>'));
                rightArea.append($('<tr>').addClass('ask-area').append('<td><span class="large">' + askPieces[2] + '</span><span class="small">' + bidPieces[3] + '</span></td>'));


                dataArea.append($('<td>').append(leftArea));
                dataArea.append($('<td>').append(rightArea));
                table.append(dataArea);
                item.append(table);
                list.append(item);

                item[0].querySelectorAll(".symbol-area .close")[0].onclick = bidaskClose;

            }
        });

        containerObject.show();

    });
}

function bidask(list) {
    list = JSON.parse(list);
    symbolList = [];
    _.each(list, function (widgetId) {
        var containerId = 'ciq-' + widgetId;
        var settings = defaultSettings.items[widgetId];
        var containerObject = $('#' + containerId);
        containerObject.append('<ul id="' + containerId + '_sortable"></ul>');
        var symbols = localStorage.getItem(widgetId);
        if (!symbols) symbols = settings.symbols;
        else symbols = JSON.parse(symbols);
        if (!symbols) symbols = [portalSettings.defaultSymbol];

        if (settings.message && settings.message.data && settings.message.data.symbol) {
            settings.symbol = settings.message.data.symbol;
        }

        if (settings.symbol) {
            symbols.push(settings.symbol);
        }

        settings.symbols = _.uniq(symbols);
        localStorage.setItem(widgetId, JSON.stringify(settings.symbols));

        symbolList = _.concat(symbolList, settings.symbols);

    });
    symbolList = _.uniq(symbolList);

    dataSources[portalSettings.dataSource].fetchQuotes(symbolList, bidaskCallback, list);

    require(['modules/quote'], function () {
        quoteSymbolList[_.join(list)] = symbolList;
        //quoteSymbolList = _.union(quoteSymbolList, symbolList);
        quoteDependencyList[_.join(list)] = {
            quoteCallback: bidaskCallback,
            extraParams: list
        };
        updateQuote();
    });

}