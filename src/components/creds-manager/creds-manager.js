FSBL.addEventListener('onReady', () => {
  const components = []
  FSBL.Clients.WindowClient.setWindowTitle('Creds Manager')
  FSBL.Clients.LauncherClient
  .getComponentList((error, data = []) => {
    for(const key in data) {
      FSBL.Clients.LauncherClient
      .getComponentDefaultConfig(key, (error, config) => {
        // Save only components that has auth key in config
        if (!error && config.auth) {
          components.push({
            auth: config.auth,
            name: key
          })
        }
      })
    }
    // Create the vue app
    createApp(components)
  })
})

function createApp(components) {
  new Vue({
    el: '#app',
    data: {
      compList: components
    }
  })
}
