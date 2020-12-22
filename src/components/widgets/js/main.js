
var version = 'v2';
var subVersion = '3.0.0';

var hostname = location.hostname;
var portalCore;
var baseUrl = '';

if (hostname != "127.0.0.1" && hostname != "localhost") {
    portalCore = 'https://widgetcdn.chartiq.com/' + version + '/' + subVersion + '/js/modules/portalcore.js';
    baseUrl = 'https://widgetcdn.chartiq.com/' + version + '/' + subVersion + '/';
} else {
    //portalCore = '../minjs/modules/portalcore';
    portalCore = 'modules/portalcore';
}

window.baseJsUrl = baseUrl + 'js/';
window.cssUrl = baseUrl + 'css/';

require([portalCore], function () {

});