var appId = '';
var appPath = '';
var appName = '';

const LOCAL_APP_ID = 'finsembleLocalAppId'
const LOCAL_APP_PATH = 'https://localhost.chartiq.com:3375/assets/finsemble-symphony/app.html'
const LOCAL_APP_NAME = 'Finsemble LOCAL'

const DEV_APP_ID = 'finsembleDevAppId'
const DEV_APP_PATH = 'https://salesdemo-dev.finsemble.com/assets/finsemble-symphony/app.html'
const DEV_APP_NAME = 'Finsemble DEV'

const STAGING_APP_ID = 'finsembleStagingAppId'
const STAGING_APP_PATH = 'https://salesdemo-staging.finsemble.com/assets/finsemble-symphony/app.html'
const STAGING_APP_NAME = 'Finsemble STAGING'

const PROD_APP_ID = 'finsembleAppId'
const PROD_APP_PATH = 'https://salesdemo.finsemble.com/assets/finsemble-symphony/app.html'
const PROD_APP_NAME = 'Finsemble'

switch (window.location.hostname) {
    case 'localhost.chartiq.com':
        appId = LOCAL_APP_ID;
        appPath = LOCAL_APP_PATH
        appName = LOCAL_APP_NAME
        break;
    case 'salesdemo-dev.finsemble.com':
        appId = DEV_APP_ID;
        appPath = DEV_APP_PATH
        appName = DEV_APP_NAME
        break;
    case 'salesdemo-staging.finsemble.com':
        appId = STAGING_APP_ID;
        appPath = STAGING_APP_PATH
        appName = STAGING_APP_NAME
        break;
    case 'salesdemo.finsemble.com':
        appId = PROD_APP_ID;
        appPath = PROD_APP_PATH
        appName = PROD_APP_NAME
        break;
    default:
        break;
}

module.exports = {
    appId,
    appPath,
    appName
}