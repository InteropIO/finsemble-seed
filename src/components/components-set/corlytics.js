const CMClients = require('../../clients/credsmanager')
const CredsManager = new CMClients.CredsManager('Corlytics')

FSBL.addEventListener('onReady', () => {
  CredsManager.login().then((creds) => {

  })
})
