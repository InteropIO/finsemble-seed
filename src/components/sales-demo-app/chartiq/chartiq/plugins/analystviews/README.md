TradingCentral Analyst Views Plugin
=====================

Displays an *analysis* from the [Trading Central](https://www.tradingcentral.com) XML API.

Enabling the plugin
-------------------

The plugin is currently designed to work with the advanced template.
 1. Start by un-commenting the components script/import for trading central:
    ```html
		<!-- <script src="plugins/analystviews/components.js"></script> -->
    ```

    or

    ```js
		//import "plugins/analystviews/components";
    ```
 
 2. Use real data. Fake data will not match the analysis.

Files
-----

```
├── components.js                   # see components below (and loads controller)
├── controller.js                   # load & parse XML, draw lines on the chart, etc
├── img
│   ├── cq-details-toggle-day.png   # details component arrow (day theme)
│   ├── cq-details-toggle-night.png # details component arrow (night theme)
│   ├── logo.jpg                    # trading central logo, not an official copy
│   ├── tc-bearish-1.png            # downward trend arrow, "conservative"
│   ├── tc-bearish-2.png            # downward trend arrow, "steep"
│   ├── tc-bullish-1.png            # upward trend arrow, "conservative"
│   └── tc-bullish-2.png            # upward trend arrow, "steep"
├── line-info.html                  # inserted by controller as a marker when hovering over an analysis line
├── line-info.json                  # controller creates the text of the marker from the values of this file
├── README.md
├── ui.css                          # verbose style for components and font colors, including day theme
└── ui.html                         # innerHTML of the cq-analystviews component
```

Components
----------

 * `<cq-analystviews>` - Primary tag, *partner* and *token* attributes required.
 * `<cq-analystviews-details>` - Custom implementation of [`<details>`][details] with the open token on the right.
 * `<cq-analystviews-number>` - Analysis tool that helps connect the text with the lines displayed on the chart.

[details]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details "HTML Details Tag"
