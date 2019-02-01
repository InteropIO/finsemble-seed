## Questions and support

If you have questions or get stuck using this project or the ChartIQ library, the dev support team can be reached through [dev@chartiq.com](mailto:dev@chartiq.com).

# Charting-Library---React-Seed-Project

This is a basic build of the ChartIQ library within the React framework. This provides an example of how to implement the most common elements in the library. This is not a comprehensive example, more like a good starting point for an React developer.

## Requirements

* A copy of the ChartIQ library, version 3.0+ is required. To get your copy, visit https://www.chartiq.com/products/html5-charting-library/ to see a demo and get in touch with us.

* NodeJS (https://nodejs.org/). We use NodeJS and Node Package Manager (NPM) to load the React components as well as the different libraries to transform JSX and ES6 to ES5.

## Getting started

To view the example, you will need to copy or link the ChartIQ `js` and `css` directories inside of the `chartiq` directory. To do this, execute the following commands in a terminal or command line:

### In OS X:

```
ln -s <path to extracted ChartIQ library>/js <path to React Seed project>/chartiq
ln -s <path to extracted ChartIQ library>/css <path to React Seed project>/chartiq
```
*NOTE: Use full paths, not relative paths here. (e.g. instead of "~/Documents" use "/Users/<username>/Documents"*

### In Windows:

```
mklink /d <path to React Seed project>\chartiq\js <path to extracted ChartIQ library>\js
mklink /d <path to React Seed project>\chartiq\css <path to extracted ChartIQ library>\css
```

Using symlinks is not required. If preferred the js and css from the charting library can be copied and pasted into these directories (<react_seed_dir>/chartiq/js and css respectively)

### Running Locally

You will need to install the project's dependencies and build the distribution file by running the following command from the project's root:

```
npm install
```

Once you have that, run ```npm start``` and open your browser window to localhost port 3000 to view the fully working example.

## Project Structure and Customization

*Note: We do not recommend using the web components from template-advanced.html within frameworks. Unless you are familiar with integrating web components into React components, you are better off building framework components that interface with the charting library.*


#### React-Redux

All of the project source is in the `src` folder. The main ChartIQ charting component is in `./src/components/Chart.jsx`. This file is connected to a redux store inside of `./src/containers/chartContainer.js`. Whenever the `chartReducer` pushes a state change, the `ChartContainer` component will catch the new data and pass the `ciq` object to the UI elements so they can update according the state of the chart. When the chart container mounts it calls a redux action which creates a new stx object from the charting library, and passes the chartContainer node to it.

```
case Types.SET_CONTAINER:
      let ciq = new CIQ.ChartEngine({
        container: action.container
      })
      ciq.attachQuoteFeed(state.service, { refreshInterval: state.refreshInterval })
      ciq.setMarketFactory(CIQ.Market.Symbology.factory);
      // new CIQ.ExtendedHours({stx:stxx, filter:true});
      ciq.newChart(state.symbol)
      return Object.assign({}, state, {
        ciq: ciq
      })
```

If you desire to manage state outside of the redux support provided 'out-of-the-box', the UI elements provided are available to build a UI/wrapper around your own charting node where you can create and manage a ChartEngine instance elsewhere.

#### Components

All React components exist within the `./src/components` folder and its subfolders.  These include items for configuring themes, studies, chart options, and drawings.  The hierarchy of compnents can be seen by starting with `Chart.jsx` and traversing down the hierarchy.  These components should be able to be reused and adapted for use in other projects.

#### Quotefeed

This seed project uses the ChartIQ quote simulator to view randomized data with no dependency on a paid datasource, but one can be developed and included by altering the `ciq.attachQuoteFeed(window.quoteFeedSimulator)` call in the `SET_CHART_CONTAINER` action within the `chartReducer`.  See [documentation.chartiq.com](https://documentation.chartiq.com/) for more details.


## Building for use in the browser

This project is using Webpack to transform JSX and ES6 to ES5. The configs for this are in the `webpack.config.js`.
Running `npm run build` from the command line will re-create the distribution file `dist/main.js`.
This is a transformed and bundled version of everything in the src directory. `src/index.js` will automatically load this file.

## Contributing to this project

If you wish to contribute to this project, fork it and send us a pull request.
We'd love to see what it is you want to do with our charting tools!
