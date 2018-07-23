class FormConfig {

  constructor(compName) {
    if (typeof compName !== 'string') {
      throw new Error('Please pass a valid name')
    }
    this.component = compName
  }

  get() {
    return new Promise((resolve, reject) => {
      FSBL.Clients.LauncherClient
      .getComponentDefaultConfig(this.component, (error, config) => {
        // Save only components that has auth key in config
        if (!error && config.auth) {
          resolve(config.auth)
        } else {
          reject(new Error('Not supported'))
        }
      })
    })
  }
}

module.exports = FormConfig
