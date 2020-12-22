## Generic Chart Library Instructions:
If you would like to use ChartIQ as a node package, please use the accompanying tarball and install directly with npm.
	- For help installing please see https://documentation.chartiq.com/tutorial-Installing%20with%20npm.html
	- This package is designed for versions 7.2.0 and above. Usage with earlier versions may require additional configuration.
If you would like to use ChartIQ with script tags or outside of NPM, please use the chartiq folder and see its contents.
	- A description of the folders and files can be found at: https://documentation.chartiq.com/tutorial-file-by-file-descriptions.html

If you are new to using ChartIQ's library we recommend that you visit the quick start guide at: https://documentation.chartiq.com/tutorial-Quick%20Start.html
Full documentation can be found at https://documentation.chartiq.com


## Update Instructions:

When updating the charting packages make sure to copy the following changes from the chartiq folder:
- *technical-analysis-chart.html* has changed to use the dark theme by default and other changes to improve loading times, ensure to copy this or diff the file. IF copying directly it will remove all changes.
- *marketWatch.html* the onload event has been removed from the body into the preload, ensure to remove this or the marketWatch will throw an error.

## Usage:

### Chart:
The chart comprises of :
- *chartiq/** holds the Chart library and templates
- *config.json* for the chart config
- *finsemble.webpack.json* to build the chart
- *chartiq.js* & *chart-integration.js* are the preload files for the chart to work inside of Finsemble. These files deal with context charing (Linker, Drag and Drop etc) and getting and setting the state for the component.

### Active Trader:
Active Trader is made up of the following:
- Order Book
- Trade History
- Order Book

Active trader components are comprised of a number of files:
- *chartiq/plugins/cryptoiq/** holds the styling and js files
- *finsemble.webpack.json* holds the build for the Active Trader components
- *active-trader/config* is the config file for all Active Trader components
- *active-trader/active-trader-integration.js* is part of the preload for all 3 components and holds the context charing (Linker, Drag and Drop etc) and getting and setting the state for the component.
- *active-trader-marketdepth.js*, *active-trader-orderbook.js*, *active-trader-tradehistory.js* are the main preloads for each of the components. They have different methods of displaying the chart.