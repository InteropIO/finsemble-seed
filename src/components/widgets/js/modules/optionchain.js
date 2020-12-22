if (!window.optionData) window.optionData = {};

function showOptionTable(containerObject, symbol, id, type) {
    var containerId = containerObject.attr('id');
    require(['datatablesresponsive'], function () {
        var dataTable;
        if (!$('#' + containerId + '-table').length) {
            var table = $('<table>').attr('id', containerId + '-table').css('width', '100%').addClass('display responsive');
            containerObject.append(table);
            dataTable = table.dataTable({
                'data': _.values(window.optionData[symbol][id].Combination),
                "columns": [
                    { "data": "Call_OpenInterest", title: "Open Interest", responsivePriority: 3, className: "ciq_call" },
                    { "data": "Call_PercentChange", title: "Percent Change", responsivePriority: 7, className: "ciq_call" },
                    { "data": "Call_Change", title: "Change", responsivePriority: 6, className: "ciq_call" },
                    { "data": "Call_PreviousClose", title: "Previous Close", responsivePriority: 5, className: "ciq_call" },
                    { "data": "Call_Last", title: "Last", responsivePriority: 4, className: "ciq_call" },
                    { "data": "Call_Ask", title: "Ask", responsivePriority: 2, className: "ciq_call" },
                    { "data": "Call_Bid", title: "Bid", responsivePriority: 2, className: "ciq_call" },
                    { "data": "Call_Symbol", title: "Call Symbol", responsivePriority: 8, className: "ciq_call" },
                    { "data": "Call_StrikePrice", title: "Strike Price", responsivePriority: 1, className: "ciq_strikePrice" },
                    { "data": "Put_Symbol", title: "Put Symbol", responsivePriority: 8, className: "ciq_put" },
                    { "data": "Put_Bid", title: "Bid", responsivePriority: 2, className: "ciq_put" },
                    { "data": "Put_Ask", title: "Ask", responsivePriority: 2, className: "ciq_put" },
                    { "data": "Put_Last", title: "Last", responsivePriority: 4, className: "ciq_put" },
                    { "data": "Put_PreviousClose", title: "Previous Close", responsivePriority: 5, className: "ciq_put" },
                    { "data": "Put_Change", title: "Change", responsivePriority: 6, className: "ciq_put" },
                    { "data": "Put_PercentChange", title: "Percent Change", responsivePriority: 7, className: "ciq_put" },
                    { "data": "Put_OpenInterest", title: "Open Interest", responsivePriority: 3, className: "ciq_put" },

                ],
                order: [[8, 'asc']],
                responsive: {
                    details: false
                },
                "lengthMenu": [[-1, 10, 25, 50], ["All", 10, 25, 50]]
            });
        } else {
            dataTable = $('#' + containerId + '-table').DataTable();
            dataTable.clear();
            dataTable.rows.add(_.values(window.optionData[symbol][id].Combination));
            dataTable.draw();
        }
        for (var i = 0; i < dataTable.DataTable().rows().count(); i++) {
            var row = dataTable.DataTable().row(i);
            var data = row.data();
            if (data.Call_InTheMoney) {
                $(row.node()).addClass('ciq_callInTheMoney')
            }
            if (data.Put_InTheMoney) {
                $(row.node()).addClass('ciq_putInTheMoney')
            }

        }

    });


}

function optionchainCallback(error, data, containerObject) {
    //debugger;
    var containerId = containerObject.attr('id');
    var widgetId = containerId.substring(4);
    var settings = portalSettings.items[widgetId];
    if (settings.message && settings.message.data && settings.message.data.symbol) {
        settings.symbol = settings.message.data.symbol;
    }
    if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
    window.optionData[settings.symbol] = {};
    var select = $('<select>').attr('id', containerId + '-select');
    _.each(data, function (value, key) {
        var option = $('<option>').attr('value', key).append(value.ExpirationDate);
        select.append(option);
        var Combination = {};
        _.each(value.Calls, function (call) {
            if (!Combination[call.StrikePrice]) Combination[call.StrikePrice] = {};
            _.each(call, function (cvalue, ckey) {
                Combination[call.StrikePrice]['Call_' + ckey] = cvalue;
            });
        });
        _.each(value.Puts, function (put) {
            if (!Combination[put.StrikePrice]) Combination[put.StrikePrice] = {};
            _.each(put, function (cvalue, ckey) {
                Combination[put.StrikePrice]['Put_' + ckey] = cvalue;
            });
        });
        window.optionData[settings.symbol][key] = {
            'Date': value.ExpirationDate,
            'Calls': value.Calls,
            'Puts': value.Puts,
            'Combination': Combination
        };
    });
    containerObject.html(select);
    $('#' + containerId + '-select').change(function () {
        showOptionTable(containerObject, settings.symbol, this.value, 'Calls');
    });

    showOptionTable(containerObject, settings.symbol, 0, 'Calls');
}

function optionchain(list) { //function is intentionally not camelcase
    list = JSON.parse(list);
    _.each(list, function (value, key) {
        var container = 'ciq-' + value;
        var settings = defaultSettings.items[value];
        var containerObject = $('#' + container);
        settings.id = key;
        if (!settings.symbol) settings.symbol = portalSettings.defaultSymbol;
        dataSources[portalSettings.dataSource].fetchOptionChain(settings, optionchainCallback, containerObject);
        containerObject.show();
    });
    PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/css/jquery.dataTables.min.css');
    PortalCore.addStyleSheet('https://cdn.jsdelivr.net/jquery.datatables/1.10.10/plugins/responsive/css/responsive.dataTables.min.css');

}