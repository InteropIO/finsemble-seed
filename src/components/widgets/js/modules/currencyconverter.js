function currencyQuoteCallback(err, data, extraParams) {
    var containerObject = extraParams.containerObject;
    var containerId = containerObject.attr('id');
    var c1 = $('#' + containerId + '-c1').val();
    var c2 = $('#' + containerId + '-c2').val();
    var conversion = data[c1 + c2].Last;
    $('#' + containerId + '-result').html(conversion.toPrecision(6));
    //$('#' + containerId + '-result').append(' / Inverse: ' + (1/data[c1 + c2].Last).toPrecision(6));
    var a1 = $('#' + containerId + '-a1div input').val();
    var a2 = $('#' + containerId + '-a2div input').val();
    if (extraParams.trigger == 'c2') {
        $('#' + containerId + '-a1div input').val((a2 / conversion).toFixed(2));
    } else {
        $('#' + containerId + '-a2div input').val((a1 * conversion).toFixed(2));
    }

}

function currencyConverterCallback(err, data, containerObject) {
    var containerId = containerObject.attr('id');
    var widgetId = containerId.split('-')[1];
    var settings = defaultSettings.items[widgetId];
    require(['https://cdn.jsdelivr.net/chosen/1.7.0/chosen.jquery.js'], function () {
        var selectC1 = $('<select>').attr('id', containerId + '-c1').addClass('chosen-select');
        var selectC2 = $('<select>').attr('id', containerId + '-c2').addClass('chosen-select');
        _.each(data, function (currency) {
            var iconSpan = $('<span>').addClass('ciq-cc-icon').width(20).height(10);
            if (currency.Countries[0] && currency.Countries[0].Code) {
                var code = currency.Countries[0].Code.toLowerCase();
                if (code=='uk') code='gb';
                if (currency.Symbol == 'INR') code = 'in';

                iconSpan.css('background-image', 'url(https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.8.0/flags/1x1/' + code + '.svg)').css('background-size', '20px 10px');

            }
            var option = $('<option>').attr('value', currency.Symbol).html(iconSpan)
            option.append('<span class="ciq-cc-symbol"> ' + currency.Symbol + ' </span> <span class="ciq-cc-name"> ' + currency.Name + ' </span>');
            selectC1.append(option);
            selectC2.append(option.clone())
        });
        $('#' + containerId + '-c1div').html(selectC1);
        $('#' + containerId + '-c2div').html(selectC2);
        containerObject.show();
        $('.chosen-select').chosen();
        $('.chosen-select').on('chosen:showing_dropdown', function (e) {
            //change height of parent to height of element
            var c = $('#' + e.target.id.split('-').join('_') + '_chosen');
            settings.originalHeight = c.height()
            c.height(settings.originalHeight + c.children('.chosen-drop').height());
            c.children('.chosen-drop').css('top', settings.originalHeight + 'px');
        });
        $('.chosen-select').on('chosen:hiding_dropdown', function (e) {
            //change height of parent to height of element
            var c = $('#' + e.target.id.split('-').join('_') + '_chosen');
            c.height(settings.originalHeight);
        });
        $('.chosen-select').on('change', function (e) {
            var c1 = $('#' + containerId + '-c1').val();
            var c2 = $('#' + containerId + '-c2').val();
            if (c1 != c2) {
                dataSources[portalSettings.dataSource].fetchQuotes([c1 + c2 /*, 'USD'+c1, 'USD'+c2*/], currencyQuoteCallback, {"containerObject": containerObject, "trigger": e.target.id.slice(-2)})
            } else {
                $('#' + containerId + '-result').html('');
            }
            var c = $('#' + e.target.id.split('-').join('_') + '_chosen');
            if (c.height() > c.children('.chosen-drop').height()) {
                c.height(settings.originalHeight);
            }
            if (_.endsWith(e.target.id, 'c1')) {
                a1Change(e);
            } else {
                a2Change(e);
            }

        });
        var a1Change = function (e) {
            var a1 = $('#' + containerId + '-a1div input').val();
            var c1 = $('#' + containerId + '-c1').val();
            var c2 = $('#' + containerId + '-c2').val();
            var conversion = 1;
            if (c1 != c2) conversion = $('#' + containerId + '-result').html();
            if (a1 * conversion == 0) {
                $('#' + containerId + '-a1div input').val(100);
                a1 = 100;
            }
            $('#' + containerId + '-a2div input').val((a1 * conversion).toFixed(2));
        }
        var a2Change = function (e) {
            var a2 = $('#' + containerId + '-a2div input').val();
            var c1 = $('#' + containerId + '-c1').val();
            var c2 = $('#' + containerId + '-c2').val();
            var conversion = 1;
            if (c1 != c2) conversion = $('#' + containerId + '-result').html();
            if (a2 * conversion == 0) {
                $('#' + containerId + '-a2div input').val(100);
                a2 = 100;
            }
            $('#' + containerId + '-a1div input').val((a2 / conversion).toFixed(2));
        }
        $('#' + containerId + '-a1div input').on('keyup', a1Change);
        $('#' + containerId + '-a1div input').on('change', a1Change);

        $('#' + containerId + '-a2div input').on('keyup', a2Change);
        $('#' + containerId + '-a2div input').on('change', a2Change);


    });
}

function currencyconverter(list) {//function is intentionally not camelcase
    if (!window.cachedQuotes) window.cachedQuotes = {}
    list = JSON.parse(list);
    //PortalCore.addStyleSheet('https://cdn.jsdelivr.net/chosen/1.7.0/chosen.css');
    _.each(list, function (widgetId, key) {
        var containerId = 'ciq-' + widgetId;
        var containerObject = $('#' + containerId);
        containerObject.append('<div class="ciq-cc-canda"><div id="' + containerId + '-a1div" class="ciq-cc-amount"><input type="number" value="100"></div><div id="' + containerId + '-c1div" class="ciq-cc-currency"></div></div><div class="ciq-cc-canda"><div id="' + containerId + '-a2div" class="ciq-cc-amount"><input type="number" value="100"></div><div id="' + containerId + '-c2div" class="ciq-cc-currency"></div></div><div id="' + containerId + '-result"></div>')
        var settings = portalSettings.items[widgetId];

        dataSources[portalSettings.dataSource].fetchCurrencyList(settings, currencyConverterCallback, containerObject);

    });


}