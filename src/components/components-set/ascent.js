const CMClients = require('../../clients/credsmanager')
const CredsManager = new CMClients.CredsManager('Ascent')

FSBL.addEventListener('onReady', () => {
  CredsManager.login().then((creds) => {

  })
})
