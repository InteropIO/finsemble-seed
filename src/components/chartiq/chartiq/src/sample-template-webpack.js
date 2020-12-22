import "chartiq/js/thirdparty/perfect-scrollbar.jquery.js";
//import "chartiq/js/thirdparty/splines.js";
import { CIQ } from 'chartiq/js/chartiq';
import "chartiq/js/addOns";
import "chartiq/js/components";
//import "chartiq/examples/feeds/L2_simulator"; /* for use with cryptoiq */
import "chartiq/examples/feeds/symbolLookupChartIQ";
import "chartiq/examples/markers/tradeAnalyticsSample";
import "chartiq/examples/markets/marketDefinitionsSample";
import "chartiq/examples/markets/marketSymbologySample";
import "chartiq/examples/translations/translationSample";
import "chartiq/css/perfect-scrollbar.css";
import "chartiq/css/normalize.css";
import "chartiq/css/page-defaults.css";
import "chartiq/css/stx-chart.css";
import "chartiq/css/chartiq.scss";
import "chartiq/examples/markers/markersSample.css";
import "chartiq/examples/markers/tradeAnalyticsSample.css";
/* Uncomment to enable these plugins */
//import "chartiq/plugins/cryptoiq/cryptoiq";
//import "chartiq/plugins/recognia/components"
//import "chartiq/plugins/scriptiq/scriptiq";
//import "chartiq/plugins/tfc/tfc-loader";
//import "chartiq/plugins/tfc/tfc-demo";   /* if using demo account class */
//import {wgxpath} from 'chartiq/plugins/tradingcentral/thirdparty/wgxpath.install';  /* IE11 XPath support */
//if(typeof XPathEvaluator==="undefined") wgxpath.install(window);            /* IE11 XPath support */
//import "chartiq/plugins/tradingcentral/components";
//import "chartiq/plugins/visualearnings/visualearnings";
//import "chartiq/plugins/timespanevent/timespanevent";
//import "chartiq/plugins/timespanevent/examples/timeSpanEventSample";  /* if using sample */
/* end plugins */
import {createChart} from "chartiq/examples/templates/js/sample-template";
var stxx = createChart();
