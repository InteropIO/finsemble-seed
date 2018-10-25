TradingCentral Plugin
=====================

Displays an *analysis* from the [Trading Central](https://www.tradingcentral.com) XML API.

Enabling the plugin
-------------------

The plugin is currently designed to work with "sample-template-advanced.html".

 1. Start by un-commenting the [toggle][], [element][], and [javascript][].
 2. If you are using Internet Explorer, add [wicked good xpath][wgxpath].

     ```html
     <script src="plugins/tradingcentral/thirdparty/wgxpath.install.js"></script>
     <script>wgxpath.install()</script>
     ```

 3. Use real data. Fake data will not match the analysis.

     ```javascript
     // remember to load the quoteFeedXignite.js file
     stxx.attachQuoteFeed(new CIQ.QuoteFeed.Xignite(), {refreshInterval: 1});
     ```

Files
-----

```
├── components.js                   # see components below (and loads controller)
├── controller.js                   # load & parse XML, draw lines on the chart, etc
├── img
│   ├── cq-details-toggle-day.png   # details component arrow (day theme)
│   ├── cq-details-toggle-night.png # detials component arrow (night theme)
│   ├── logo.jpg                    # trading central logo, not an official copy
│   ├── tc-bearish-1.png            # downward trend arrow, "conservative"
│   ├── tc-bearish-2.png            # downward trend arrow, "steep"
│   ├── tc-bullish-1.png            # upward trend arrow, "conservative"
│   └── tc-bullish-2.png            # upward trend arrow, "steep"
├── line-info.html                  # inserted by controller as a marker when hovering over an analysis line
├── line-info.json                  # controller creates the text of the marker from the values of this file
├── README.md
├── thirdparty
│   └── wgxpath.install.js          # google implemtation of XPath, used to support IE
├── ui.css                          # verbose style for components and font colors, including day theme
└── ui.html                         # innerHTML of the cq-tradingcentral component
```

Components
----------

 * `<cq-tradingcentral>` - Primary tag, *partner* and *token* attributes required.
 * `<cq-details>` - Custom implementation of [`<details>`][details] with the open token on the right.
 * `<cq-tc-number>` - Analysis tool that helps connect the text with the lines displayed on the chart.


[toggle]: https://github.com/ChartIQ/stx/blob/6c39619b0d1e86878cf091931bdd1dfebb9ad575/htdocs/default/sample-template-advanced.html#L228-L229 "Toggle location"
[element]: https://github.com/ChartIQ/stx/blob/6c39619b0d1e86878cf091931bdd1dfebb9ad575/htdocs/default/sample-template-advanced.html#L239 "Element location"
[javascript]: https://github.com/ChartIQ/stx/blob/6c39619b0d1e86878cf091931bdd1dfebb9ad575/htdocs/default/sample-template-advanced.html#L1025 "Javascript location"
[wgxpath]: https://github.com/google/wicked-good-xpath "Wicked Good XPath"
[details]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details "HTML Details Tag"
