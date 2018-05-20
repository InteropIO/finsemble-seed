
if (!window.activeNewsItems) window.activeNewsItems = {}

$('.ciq-TickerNews').on('click', 'li', function () {
	var li = $(this);
	var ul = li.parent();

	if (li.hasClass('active')) {
		li.removeClass('active');
	} else {
		_.each(ul.children(), function (value) {
			$(value).removeClass('active');
		});
		li.addClass('active');
		activeNewsItems[ul.attr('id')] = $($(this).find('a')[0]).attr('href');
	}
});

function tickerNewsCallback(err, data, containerObject) {
	var containerId = containerObject.attr('id');

	if (data && data.items && data.items.length) {
		var list = $('<ul>').attr('id', containerId + '-list');
		_.each(data.items, function (value, key) {
			var itemDate = new Date(value.Date);
			var date = $('<p>').addClass('ciq-date').append(PortalCore.mmddyyyy(itemDate) + ' ' + PortalCore.ampmTime(itemDate));
			var source = $('<p>').addClass('ciq-news-source').append(value.Source);
			var parentDiv = $('<div>').addClass('ciq-news-main');
			var newsDiv = $('<div>').css('clear', 'both');
			if (value.Image) {
				console.log(value.Image);
				var img = $('<img>');
				if (location.protocol == 'https:' && _.startsWith(value.Image, 'http://')) value.Image = 'https://globalwidgets.xignite.com/image_securer/?url=' + value.Image;
				img.attr('src', value.Image);
				newsDiv.append($('<div>').addClass('ciq-news-img').append(img));
				//img.css('width', '20%')

			}

			var newsContentDiv = $('<div>').addClass('ciq-news-content');
			newsContentDiv.append($('<h4>').append(value.Subject));
			newsContentDiv.append($('<p>').addClass('ciq-news-body').append(value.Summary));
			var newsLink = $('<a>').attr('href', value.Url).attr('target', '_blank').append('Full Article');
			newsContentDiv.append($('<p>').addClass('ciq-news-link').append(newsLink));
			newsDiv.append(newsContentDiv);
			var fullItem = $('<li>').append(date).append(source).append(newsDiv);
			if (activeNewsItems[containerId + '-list']) {
				if (activeNewsItems[containerId + '-list'] == value.Url) {
					fullItem.addClass('active');
				}
			} /*else if (key == 0 && containerObject.width() > 450) fullItem.addClass('active');*/
			list.append(fullItem);

		});

		$('#' + containerId + '-list').remove();
		containerObject.append(list).addClass('ciq-news');
	}
	containerObject.show();
}

function tickernews(list, dependencyLoaded) { //function is intentionally not camelcase
	list = JSON.parse(list);
	//PortalCore.addStyleSheet(cssUrl + 'modules/marketsnews.css');
	_.each(list, function (value) {
		var settings = defaultSettings.items[value];
		var container = 'ciq-' + value;
		var containerObject = $('#' + container);

		if (settings.message && settings.message.data && settings.message.data.symbol) {
			settings.symbol = settings.message.data.symbol;
		}

		if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
		containerObject.html('<h3>Headlines For ' + settings.symbol + '</h3>');

		if (!settings.numberOfItems) settings.numberOfItems = 20;
		settings.limit = settings.numberOfItems;
		dataSources[portalSettings.dataSource].fetchSecurityHeadlines(settings, tickerNewsCallback, containerObject);

		if (portalSettings.newsRefreshRate) {
			setInterval(function () {
				dataSources[portalSettings.dataSource].fetchSecurityHeadlines(settings, tickerNewsCallback, containerObject);
			}, portalSettings.newsRefreshRate * 1000)
		}
	});

}