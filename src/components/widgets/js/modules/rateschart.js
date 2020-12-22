function setRatesChartRange(stxx, range, container) {
	//var se
	//dataSources[portalSettings.dataSource].fetchHistoricalRates(settings, ratesChartCallback, containerObject);
	var rangeUnit = range.slice(-1);
	var rangePeriod = range.substring(0, range.length - 1);

	switch (rangeUnit) {
		case 'D':
			if (rangePeriod == 5) rangePeriod = 7;
			stxx.setSpan({
				multiplier: rangePeriod,
				span: "day",
				periodicity: {
					interval: "day",
					period: 1
				}
			});
			break;
		case 'M':
			stxx.setSpan({
				multiplier: rangePeriod,
				span: "month",
				periodicity: {
					interval: "day",
					period: 1
				}
			});
			break;
		case 'Y':
			stxx.setSpan({
				multiplier: rangePeriod,
				span: "year",
				periodicity: {
					interval: "day",
					period: 1
				}
			});
			break;
	}
}

function ratesChartCallback(error, data, containerObject) {
	//debugger;
	containerObject.css('display', 'block').css('position', 'relative').css('float', 'left');
	var containerId = containerObject.attr('id');
	var settings = defaultSettings.items[containerId.split('-')[1]];
	var chartContainerId = containerId + '-chart';
	var stxx;
	if (!$('#' + chartContainerId).length) {

		containerObject.addClass('ciq-BasicChart');

		var legend = $('<div>').attr('id', containerId + '-legend').addClass('ciq-legend');
		containerObject.append(legend);

		containerObject.append('<div class="ciq-range-nav ciq-chart-nav-range" id="' + containerId + '-range"><ul><li range="5D">1W</li><li range="1M">1M</li><li range="3M">3M</li><li range="6M">6M</li><li range="1Y" class="active">1Y</li></ul></div>');

		var chartContainer = $('<div>').attr('id', chartContainerId).css('width', '100%').addClass('ciq-basicchart').css('height', '150px').css('position', 'relative').css('clear', 'both');
		containerObject.append(chartContainer);
		containerObject.show();

		$('#' + containerId + '-range li').on('click', function () {
			var parentUL = $(this).parent();
			parentUL.children().removeClass('active');
			$(this).addClass('active');
			var parentDiv = $(this).parent().parent().parent();
			var id = parentDiv.attr('id') + '-chart';
			var stxx = $('#' + id)[0].stx;
			setRatesChartRange(stxx, $(this).attr('range'), $$(id));

			//TODO: Code to set range
		});
		stxx = new CIQ.ChartEngine({
			container: $$(chartContainerId),
			layout: {
				"chartType": "line"
			}
		});
		stxx.maintainSpan = true;
		stxx.manageTouchAndMouse = false;

		stxx.widgetHeightWidthRatio = settings.heightWidthRatio;
		stxx.widgetHeight = settings.height;

		stxx.preferences.whitespace = 0;
		//stxx.yaxisLeft = 0;
		stxx.cleanupGaps = false;
		stxx.axisBorders = false;
		stxx.panels[stxx.chart.name].yAxis.displayGridLines = false;

		var chart = stxx.chart;

		chart.baseline.includeInDataSegment = true;
		chart.baseline.userLevel = false;

		chart.xAxis.displayGridLines = false;
		chart.xAxis.displayBorder = true;
		chart.xAxis.minimumLabelWidth = 16;
		chart.xAxis.useDataDate = true;
		stxx.controls.chartControls.style.display = "none";


		//chart.yAxis.justifyRight = true;

	} else {
		var stxx = $('#' + chartContainerId)[0].stx;
		//chartSettings.range = stxx.requestedRange;
	}

	var i = 0;
	var colors = ['#000000', '#4495D1', '#27CC8D', '#EE5C5C', '#F0BD32', '#1EAB92', '#F38A6D'];
	if (portalSettings.darkLogos) {
		colors = ['#eeeeee', '#4495D1', '#27CC8D', '#EE5C5C', '#F0BD32', '#1EAB92', '#F38A6D'];
	}
	
		
	var legend = $('#' + containerId + '-legend');
	legend.html('');
	stxx.newChart("Equal Citizens", []);
	stxx.setPeriodicityV2(1, "day");
	_.each(data, function (value, key) {
		stxx.addSeries(key, {
			data: value,
			shareYAxis: true,
			color: colors[i],
			forceData: true,
			permanent: true
		});
		legend.append('<div style="color:' + colors[i] + '">' + key + '</div>');
		if (i == 0) {
			stxx.setRange(value[0].DT, value[value.length - 1].DT);
		}
		i++;
	});
	stxx.createDataSet();

	stxx.draw();


}

function rateschart(list) {

	if (!window.availableChartLibrary) window.availableChartLibrary = 'basicchart';
	require([availableChartLibrary], function () {
		window.CIQ = arguments[0].CIQ;
		window.$$ = arguments[0].$$;
		CIQ.ChartEngine.prototype.prepend("resizeChart", function () {
			var jContainer = $('#' + this.container.id);
			if (this.widgetHeightWidthRatio) {
				jContainer.height(jContainer.width() * this.widgetHeightWidthRatio);
			} else if (this.widgetHeight) {
				jContainer.height(this.widgetHeight);
			} else {
				jContainer.height(jContainer.width() * 9 / 21);
			}
			if (this.maintainSpan && this.chart.xaxis && this.chart.xaxis.length) {
				this.cw = this.layout.candleWidth;
				this.ow = this.chart.width;
				this.s = this.chart.scroll;
			}
		});

		CIQ.ChartEngine.prototype.append("resizeChart", function () {
			if (this.maintainSpan && this.ow) {
				var ot = this.ow / this.cw;
				this.layout.candleWidth = this.chart.width / ot;
				this.chart.scroll = this.s;
				this.draw();
			}
		});

		//list = JSON.parse(list);
		_.each(list, function (value, key) {
			var container = 'ciq-' + value;
			var settings = defaultSettings.items[value];
			var containerObject = $('#' + container);
			settings.id = key;
			dataSources[portalSettings.dataSource].fetchHistoricalRates(settings, ratesChartCallback, containerObject);
		});
	});

	PortalCore.addStyleSheet(cssUrl + 'modules/basic-chart.css');
	//PortalCore.addStyleSheet(cssUrl + 'modules/rateschart.css');


	//maintainspan


}