This folder contains *sample-template-native-sdk.html*, a sample template to be used with the [iOS](https://github.com/ChartIQ/Charting-Library---iOS-Sample-App) and [Android](https://github.com/ChartIQ/Charting-Library---Android-Sample-App) GitHub sample projects.

The template is a simple HTML application that can be put into a mobile `WebView` to interface with ChartIQ's JavaScript bridge library, *nativeSdkBridge.js* (in the *mobile/js* folder).

To use *sample-template-native-sdk.html*, move or copy it to the root folder of your library.

Set the value of the `displayDataDisclaimer` variable to true if the app uses simulated data; to false, if the app uses production data.

**Note:** If you are using version 8.0 or later of the ChartIQ library and want to use mobile files from a local file system, you will need to bundle the library using webpack or another module bundler. We include a webpack build specifically for the mobile project in your ChartIQ library package. The steps to create your own bundle are as follows:

1. Make any necessary changes to *chartiq/webpack.config.mobile.js* and *chartiq/src/sample-template-native-sdk-webpack.js*.
2. Execute `npm run build:mobile` in the directory that has the *package.json* file that came with your package.
3. If everything is correct, a new folder named *dist* will be created with your bundled library.
4. By default, the template file will be *dist/index.html*; change the file name if needed.
5. Take the *dist* folder and import it locally into your mobile project. Follow the necessary steps to access *index.html*.
