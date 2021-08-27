import { CIQ } from "../../../js/chartiq.js";
import { ChartLinker } from "./chart-linker.js";
import getDefaultConfig from "../../../js/defaultConfiguration.js";
import PerfectScrollbar from "../../../js/thirdparty/perfect-scrollbar.esm.js";
import quotefeed from "../../feeds/quoteFeedSimulator.js";
import "../../feeds/symbolLookupChartIQ.js";
import "../../markets/marketDefinitionsSample.js";
import "../../markets/marketSymbologySample.js";
import "../../translations/translationSample.js";
// Create and customize default configuration
const config = getDefaultConfig({
    scrollStyle: PerfectScrollbar,
    quoteFeed: quotefeed
});
var defaultGridSize = { cols: 1, rows: 1 };
// prettier-ignore
var defaultSymbols = [
    "MMM", "AAPL", "AXP", "BA", "CAT", "CVX",
    "CSCO", "KO", "DWDP", "XOM", "GS", "HD",
    "IBM", "INTC", "JNJ", "JPM", "MCD", "MRK",
    "MSFT", "NKE", "PFE", "PG", "TRV", "UNH",
    "UTX", "VZ", "V", "WMT", "WBA", "DIS"
];
var activeMarket = "NYSE";
var chartLinker = new ChartLinker();
var UIContext;
var UILayout;
var UIStudyEdit;
var UIStorage;
var UIThemes;
var activeChart, activeChartPreSelect;
var selectionTimeout = 0;
var firstRun = true;
function RemoveAllCharts() {
    // Remove existing charts from the linker
    chartLinker.innerHTML = "";
    // Clear out existing chart component tags, but always keep chart0
    Array.from(document.querySelector(".chart-grid").children).forEach(function (
        child
    ) {
        if (!child.matches("#chart0")) child.remove();
    });
}
function AddCharts(cols, rows) {
    let idx = 0;
    // Check for an existing chart0 which we leave alone because it's linked to the UI
    let masterChart = document.getElementById("chart0");
    if (masterChart) {
        SetChartSize(masterChart, 100 / cols, 100 / rows, rows == 1);
        // Set x-axis
        if (rows == 1) {
            masterChart.setAttribute("x-axis", true);
            masterChart.stx.xaxisHeight = 30;
            if (masterChart.stx.controls.floatDate)
                masterChart.stx.controls.floatDate.style.opacity = 1;
        } else {
            masterChart.removeAttribute("x-axis");
            masterChart.stx.xaxisHeight = 0;
            if (masterChart.stx.controls.floatDate)
                masterChart.stx.controls.floatDate.style.opacity = 0;
        }
        // Trigger chart redraw
        masterChart.stx.resizeChart();
        masterChart.stx.draw();
        // Start adding charts at index 1
        idx = 1;
    }
    for (idx; idx < rows * cols; idx++) {
        AddChart(100 / cols, 100 / rows, idx >= rows * cols - cols);
    }
    if (localStorage) {
        // Store the grid dimensions to load in on return visit
        localStorage.setItem(
            "gridSize",
            JSON.stringify({ cols: +cols, rows: +rows })
        );
    }
}
function SetChartSize(element, width, height, xaxis) {
    const xaxisHeight = 20;
    let margin = 5;
    // The last row of charts lose 20px due to the x-axis.
    // Normalize the charts by taking away a total of 20px
    // from upper grid rows and giving it to the last row
    if (xaxis) {
        // No need to normalize the height if there's only one row (i.e. height of 100%).
        if (height < 100) margin -= xaxisHeight;
    } else {
        margin += xaxisHeight * (1 / (100 / height - 1));
    }
    element.style.width = "calc(" + width + "vw - 5px)";
    element.style.height =
        "calc(" + height + "vh - " + ((height / 100) * 45 + margin) + "px)";
}
function AddChart(width, height, xaxis) {
    width = width || 50;
    height = height || 20;
    xaxis = xaxis || false; // Display the x-axis
    let chartGrid = document.querySelector(".chart-grid");
    let newInstantChart = document.createElement("cq-instant-chart");
    newInstantChart.id = "chart" + chartGrid.childElementCount;
    newInstantChart.setAttribute(
        "symbol",
        defaultSymbols[chartGrid.childElementCount]
    );
    newInstantChart.setAttribute(
        "tmpl-src",
        "examples/templates/chart-grid/sample-template-grid-context.html"
    );
    if (xaxis) newInstantChart.setAttribute("x-axis", true);
    SetChartSize(newInstantChart, width, height, xaxis);
    newInstantChart.addEventListener("mouseover", function (event) {
        chartLinker.setLinkerMaster(this.id);
    });
    newInstantChart.addEventListener("mousedown", function (event) {
        // Timestamp is saved here to check on mouse up. If it happens fast enough it counts as a click.
        // Gives the chart an opportunity to override so you're not constantly selecting the chart during zoom ops.
        selectionTimeout = Date.now() + 350;
        // Store the id of the chart during mousedown to double-check during mouseup.
        activeChartPreSelect = this.id;
    });
    newInstantChart.addEventListener(
        "mouseup",
        function (event) {
            if (Date.now() < selectionTimeout && this.id == activeChartPreSelect) {
                for (let node of document.querySelectorAll("cq-instant-chart")) {
                    node.classList.remove("active");
                }
                let inputFieldSymbol = document.querySelector(".header input#symbol");
                if (activeChart && activeChart.id === this.id) {
                    //Deactivate an active chart
                    activeChart = null;
                    inputFieldSymbol.value = "";
                    inputFieldSymbol.blur();
                } else {
                    activeChart = document.getElementById(this.id);
                    activeChart.classList.add("active");
                    // Populate the symbol search with the selected chart's symbol
                    inputFieldSymbol.value = activeChart.stx.chart.symbol;
                    inputFieldSymbol.focus();
                }
            }
        }.bind(newInstantChart)
    );
    // Inject layout settings for the new chart so it matches chart0
    // The individual charts will pick up these settings on layout restore and automatically sync up their settings with the rest of the grid
    if (localStorage) {
        let chartLayout = localStorage.getItem("myChartLayoutchart0");
        // If the chart already has localstorage settings then leave it alone
        if (
            chartLayout !== null &&
            localStorage.getItem("myChartLayout" + newInstantChart.id) === null
        ) {
            // remove stored symbol from chart0
            let tmpLayout = JSON.parse(chartLayout);
            // Deleting the symbol here which will be set via attribute on the new chart component
            delete tmpLayout.symbols;
            localStorage.setItem(
                "myChartLayout" + newInstantChart.id,
                JSON.stringify(tmpLayout)
            );
        }
    }
    // Disable vector drawing. Drawing tools are currently unsupported in Chart Grid
    CIQ.ChartEngine.prototype.prepend("drawVectors", function () {
        return true;
    });
    // Add the component to the dom
    chartGrid.appendChild(newInstantChart);
}
// handler for signal-chart-ready event fired by the instant chart component
function handleChartReady(evt) {
    const { node, params, callbacks } = evt.detail;
    const { initialSymbol, restore } = params;
    // Create and customize default configuration
    const config = getDefaultConfig({
        scrollStyle: PerfectScrollbar,
        quoteFeed: quotefeed
    });
    // Set callbacks, initial symbol, storage flag
    CIQ.extend(
        config,
        {
            callbacks,
            initialSymbol,
            restore,
            enabledAddOns: {
                extendedHours: true,
                fullScreen: true,
                inactivityTimer: true
            }
        },
        true // shallow copy (to replace enabledAddOns)
    );
    // Create chart
    node.stx = config.createChart(node);
    const stx = node.stx;
    const context = node.context;
    stx.preferences.horizontalCrosshairField = "Close";
    stx.preferences.currentPriceLine = false;
    stx.layout.crosshair = false;
    stx.cleanupGaps = "carry";
    stx.bypassRightClick = true;
    stx.displayIconsClose = false;
    if (!node.getAttribute("x-axis")) {
        stx.xaxisHeight = 0;
        // Enabling xAxis.noDraw also prevents vertical grid lines which causes visual inconsistency between bottom charts and the rest.
        //stx.chart.xAxis.noDraw = true;
        if (stx.controls.floatDate) stx.controls.floatDate.style.opacity = 0;
    }
    chartLinker.add(params.initialSymbol, stx, context, node.id);
    // Start up the global UI when chart0 is ready
    if (node.id === "chart0") {
        startUI(stx);
    }
}
// Initialize the global UI attached to the ChartEngine instance of one of the grid charts.
function startUI(rootstxx) {
    UIContext = new CIQ.UI.Context(
        rootstxx,
        document.querySelector("#chart-grid[cq-context]")
    );
    UILayout = new CIQ.UI.Layout(UIContext);
    UIContext.advertiseAs(chartLinker, "Linker");
    UIContext.advertiseAs({ changeTheme }, "Theme");
    // Inject linker functions into global UI web components
    if (firstRun) {
        firstRun = false;
        let linkerFeatureInjector = new LinkerFeatureInjector();
        linkerFeatureInjector.injectStudyMenuRenderer();
        linkerFeatureInjector.injectStudyUpdate();
        linkerFeatureInjector.injectStudyLegendRenderer();
    }
    // StudyEdit
    UIStudyEdit = new CIQ.UI.StudyEdit(null, UIContext);
    // Study Legend
    document.querySelector(".header cq-study-legend").begin();
    // Custom Themes
    UIStorage = new CIQ.NameValueStore();
    UIThemes = document.querySelector("cq-themes");
    if (UIThemes)
        UIThemes.initialize({
            builtInThemes: { "ciq-day": "Day", "ciq-night": "Night" },
            defaultTheme: "ciq-night",
            nameValueStore: UIStorage
        });
    //Crosshair Toggle
    document.querySelector(".header .ciq-CH").registerCallback(function (value) {
        value = value || false;
        chartLinker.showCrosshair(value);
        if (value !== false) this.node.addClass("active");
        else this.node.removeClass("active");
    });
    //Symbol Lookup
    // Create a custom lookup driver to limit the available exchanges to those with NYSE compatible hours
    CIQ.ChartEngine.Driver.Lookup.ChartIQ = function (exchanges) {
        this.exchanges = ["XNYS", "XASE", "XNAS", "XASX", "ARCX"];
        this.url =
            "https://symbols.chartiq.com/chiq.symbolserver.SymbolLookup.service";
        this.requestCounter = 0; //used to invalidate old requests
    };
    //Inherits all of the base Look Driver's properties via `CIQ.inheritsFrom()`
    CIQ.inheritsFrom(
        CIQ.ChartEngine.Driver.Lookup.ChartIQ,
        CIQ.ChartEngine.Driver.Lookup
    );
    CIQ.ChartEngine.Driver.Lookup.ChartIQ.prototype.acceptText = function (
        text,
        filter,
        maxResults,
        cb
    ) {
        if (filter == "FX") filter = "FOREX";
        if (isNaN(parseInt(maxResults, 10))) maxResults = 100;
        let url =
            this.url + "?t=" + encodeURIComponent(text) + "&m=" + maxResults + "&x=[";
        if (this.exchanges) {
            url += this.exchanges.join(",");
        }
        url += "]";
        if (filter && filter.toUpperCase() != "ALL") {
            url += "&e=" + filter;
        }
        let counter = ++this.requestCounter;
        let self = this;
        function handleResponse(status, response) {
            if (counter < self.requestCounter) return;
            if (status != 200) return;
            try {
                response = JSON.parse(response);
                let symbols = response.payload.symbols;
                let results = [];
                for (let i = 0; i < symbols.length; i++) {
                    let fields = symbols[i].split("|");
                    let item = {
                        symbol: fields[0],
                        name: fields[1],
                        exchDisp: fields[2]
                    };
                    results.push({
                        display: [item.symbol, item.name, item.exchDisp],
                        data: item
                    });
                }
                cb(results);
            } catch (e) { }
        }
        CIQ.postAjax({ url: url, cb: handleResponse });
    };
    UIContext.setLookupDriver(new CIQ.ChartEngine.Driver.Lookup.ChartIQ());
    UIContext.UISymbolLookup = document.querySelector(".ciq-search cq-lookup");
    if (UIContext.UISymbolLookup)
        UIContext.UISymbolLookup.setCallback(function (context, data) {
            let targetSymbol = data.symbol || false;
            if (targetSymbol) {
                // Get the market name for the target symbol
                let symbolData = CIQ.Market.Symbology.factory({ symbol: targetSymbol });
                // Restrict symbols to markets with compatible hours
                if (symbolData.name === activeMarket) {
                    // If there's only one chart, there's no need to select it
                    if (chartLinker.charts.size === 1) {
                        document
                            .getElementById("chart0")
                            .context.changeSymbol(
                                document.getElementById("chart0").context,
                                data
                            );
                    } else if (activeChart) {
                        activeChart.context.changeSymbol(activeChart.context, data);
                    } else {
                        CIQ.alert(
                            "To set a chart symbol, first click on a chart to select."
                        );
                    }
                } else {
                    CIQ.alert(
                        "The symbol " +
                        targetSymbol +
                        " in market " +
                        symbolData.name +
                        " does not share the same hours as the current grid."
                    );
                }
            }
        });
    restoreSettings();
    chartLinker.setUI(UIContext, UILayout);
    CIQ.UI.begin();
}
function restoreSettings() {
    // Restore global UI settings based off chart0
    var layoutSetting = CIQ.localStorage.getItem(
        "myChartLayout" + document.querySelector("cq-instant-chart").id
    );
    if (layoutSetting) {
        layoutSetting = JSON.parse(layoutSetting);
        if (layoutSetting.crosshair)
            document.querySelector('cq-toggle[cq-member="crosshair"]').set(true);
    }
    var themeSetting = CIQ.localStorage.getItem("CIQ.Themes.prototype.current");
    if (themeSetting) {
        themeSetting = JSON.parse(themeSetting);
        if (themeSetting.theme) changeTheme(null, themeSetting.theme);
    }
}
function changeTheme(node, className) {
    // Update the page theme class before passing along to linker
    if (UIContext.currentLoadedBuiltIn)
        UIContext.topNode.classList.remove(UIContext.currentLoadedBuiltIn);
    else UIContext.topNode.classList.remove("ciq-night");
    UIContext.topNode.classList.add(className);
    UIContext.currentLoadedBuiltIn = className;
    chartLinker.changeTheme(null, className);
    // Store the theme in localStorage
    CIQ.localStorage.setItem(
        "CIQ.Themes.prototype.current",
        JSON.stringify({ theme: className })
    );
}
// Set master chart on a scrollwheel event. Used when mouseover event isn't available
// in cases such as when the browser window out of focus.
CIQ.ChartEngine.prototype.prepend("mouseWheel", function (e) {
    let { container } = e.currentTarget.stx;
    if (!container) return false;
    let targetInstantChart = container
        .closest("cq-instant-chart")
        .getAttribute("id");
    if (targetInstantChart) chartLinker.setLinkerMaster(targetInstantChart);
    return false;
});
// Listen for instant charts ready
document
    .querySelector("body")
    .addEventListener("signal-chart-ready", handleChartReady);
// Listen for new grid size request from cq-grid-size-picker
document.querySelector("body").addEventListener("update-grid", (e) => {
    if (localStorage) {
        //Clean up unused local storage. Remove surplus entries when shrinking the chart count.
        for (const [idx, componentRef] of document
            .querySelectorAll("cq-instant-chart")
            .entries()) {
            if (idx >= e.detail.columns * e.detail.rows) {
                localStorage.removeItem("myChartLayout" + componentRef.id);
            }
        }
    }
    RemoveAllCharts();
    AddCharts(e.detail.columns, e.detail.rows);
});
// Look for an existing grid size in local storage and override the default if present
if (localStorage) {
    let lsGridSize = JSON.parse(localStorage.getItem("gridSize"));
    if (
        lsGridSize &&
        typeof lsGridSize.cols === "number" &&
        typeof lsGridSize.rows === "number"
    )
        defaultGridSize = lsGridSize;
}
//Set up the initial chart grid
AddCharts(defaultGridSize.cols, defaultGridSize.rows);
// Methods in this class inject linker-friendly functions, where necessary,
// into web components used in the global UI.
class LinkerFeatureInjector {
    injectStudyUpdate() {
        Array.from(document.querySelectorAll("cq-study-dialog")).forEach(function (
            dialog
        ) {
            dialog.updateStudy = function (updates) {
                chartLinker.updateStudy(dialog.helper, updates);
            };
        });
    }
    injectStudyMenuRenderer() {
        var params = {
            excludedStudies: {
                correl: true
            },
            alwaysDisplayDialog: { ma: true, AVWAP: true }
            /*dialogBeforeAddingStudy: {"rsi": true} // here's how to always show a dialog before adding the study*/
        };
        Array.from(document.querySelectorAll(".header cq-studies")).forEach(
            function (studies) {
                // Overload the studies component render method to attach chart-linker to its events
                studies.renderMenu = function () {
                    var stx = this.context.stx;
                    var alphabetized = [];
                    var sd;
                    for (var field in CIQ.Studies.studyLibrary) {
                        sd = CIQ.Studies.studyLibrary[field];
                        if (
                            !sd ||
                            this.excludedStudies[field] ||
                            this.excludedStudies[sd.name] ||
                            sd.siqList !== undefined
                        )
                            continue; // siqList = ScriptIQ entry
                        if (!sd.name) sd.name = field; // Make sure there's always a name
                        alphabetized.push(field);
                    }
                    alphabetized.sort(function (lhs, rhs) {
                        var lsd = CIQ.Studies.studyLibrary[lhs];
                        var rsd = CIQ.Studies.studyLibrary[rhs];
                        if (lsd.name < rsd.name) return -1;
                        if (lsd.name > rsd.name) return 1;
                        return 0;
                    });
                    var menu = this.node;
                    var self = this;
                    var tapFn = function (studyName, context) {
                        return function (e) {
                            pickStudy(e.target, studyName);
                            self.dispatchEvent(new Event("resize"));
                        };
                    };
                    var contentNode = menu.find("cq-studies-content");
                    while (contentNode.length > 0 && contentNode[0].firstChild) {
                        contentNode[0].removeChild(contentNode[0].firstChild);
                    }
                    // The template gets wiped out on the first call but this method is called whenever the grid is refreshed
                    if (this.params.template.length > 0) {
                        for (var i = 0; i < alphabetized.length; i++) {
                            var menuItem = CIQ.UI.makeFromTemplate(this.params.template);
                            sd = CIQ.Studies.studyLibrary[alphabetized[i]];
                            menuItem.append(CIQ.translatableTextNode(stx, sd.name));
                            this.makeTap(menuItem[0], tapFn(alphabetized[i], this.context));
                            menu.find("cq-studies-content").append(menuItem);
                        }
                    }
                    function studyDialog(params, addWhenDone) {
                        params.context = self.context;
                        Array.from(document.querySelectorAll("cq-study-dialog")).forEach(
                            function (dialog) {
                                dialog.addWhenDone = addWhenDone;
                                dialog.open(params);
                            }
                        );
                    }
                    function pickStudy(node, studyName) {
                        var stx = self.context.stx;
                        function handleSpecialCase(flag, params, addWhenDone) {
                            if (flag === true) {
                                studyDialog(params, addWhenDone);
                                return true;
                            } else if (typeof flag === "object") {
                                for (var i in flag) {
                                    if (i == studyName && flag[i]) {
                                        studyDialog(params, addWhenDone);
                                        return true;
                                    }
                                }
                            }
                        }
                        if (
                            handleSpecialCase(
                                self.params.dialogBeforeAddingStudy,
                                { stx: stx, name: studyName },
                                true
                            )
                        )
                            return;
                        // The only difference between this and the component is it calls chartLinker.addStudy();
                        //var sd=CIQ.Studies.addStudy(stx, studyName);
                        var sd = chartLinker.addStudy(studyName);
                        handleSpecialCase(self.alwaysDisplayDialog, { sd: sd, stx: stx });
                    }
                };
                studies.initialize(params);
            }
        );
    }
    injectStudyLegendRenderer() {
        Array.from(document.querySelectorAll(".header cq-study-legend")).forEach(
            function (legend) {
                // Overload the studies component render method to attach chart-linker to its events
                legend.renderLegend = function () {
                    var stx = this.context.stx;
                    this.template.nextAll().remove();
                    function closeStudy(self, sd) {
                        return function (e) {
                            // Need to run this in the nextTick because the study legend can be removed by this click
                            // causing the underlying chart to receive the mousedown (on IE win7)
                            setTimeout(function () {
                                //if(!sd.permanent) CIQ.Studies.removeStudy(self.context.stx,sd);
                                if (!sd.permanent) chartLinker.removeStudy(sd);
                                if (self.node[0].hasAttribute("cq-marker"))
                                    self.context.stx.modalEnd();
                                self.renderLegend();
                            }, 0);
                        };
                    }
                    function editStudy(self, studyId) {
                        return function (e) {
                            var sd = stx.layout.studies[studyId];
                            if (sd.permanent || !sd.editFunction) return;
                            e.stopPropagation();
                            self.uiManager.closeMenu();
                            var studyEdit = self.context.getAdvertised("StudyEdit");
                            var params = {
                                stx: stx,
                                sd: sd,
                                inputs: sd.inputs,
                                outputs: sd.outputs,
                                parameters: sd.parameters
                            };
                            studyEdit.editPanel(params);
                        };
                    }
                    var overlaysOnly =
                        typeof this.node.attr("cq-overlays-only") != "undefined";
                    var panelOnly = typeof this.node.attr("cq-panel-only") != "undefined";
                    var customRemovalOnly =
                        typeof this.node.attr("cq-custom-removal-only") != "undefined";
                    var markerLabel = this.node.attr("cq-marker-label");
                    var panelName = null;
                    var holder = this.parentElement;
                    while (holder) {
                        if (holder.classList.contains("stx-holder")) break;
                        holder = holder.parentElement;
                    }
                    if (holder) panelName = holder.panel.name;
                    for (var id in stx.layout.studies) {
                        var sd = stx.layout.studies[id];
                        if (sd.customLegend) continue;
                        if (customRemovalOnly && !sd.study.customRemoval) continue;
                        if (panelOnly && sd.panel != panelName) continue;
                        if (overlaysOnly && !sd.overlay && !sd.underlay) continue;
                        var newChild = CIQ.UI.makeFromTemplate(this.template, true);
                        newChild.find("cq-label").html(sd.inputs.display);
                        var close = newChild.find(".ciq-close");
                        if (sd.permanent) {
                            close.hide();
                        } else {
                            CIQ.UI.stxtap(close[0], closeStudy(this, sd));
                        }
                        var edit = newChild.find(".ciq-edit");
                        if (!edit.length) edit = newChild.find("cq-label");
                        CIQ.UI.stxtap(edit[0], editStudy(this, id));
                    }
                    //Only want to display the marker label if at least one study has been
                    //rendered in the legend. If no studies are rendered, only the template tag
                    //will be in there.
                    if (typeof markerLabel != "undefined") {
                        if (!this.node.find("cq-marker-label").length) {
                            this.node.prepend(
                                "<cq-marker-label>" + markerLabel + "</cq-marker-label>"
                            );
                        }
                    }
                    this.displayLegendTitle();
                };
            }
        );
    }
}
