const FormConfig = require('./form-config')
const Loader = require('./loader')
const Router = FSBL.Clients.RouterClient
const ManagerLauncher = require('./manager-launcher')

/**
* This client library could be used in any component
* in mind control to retrieve creds from the creds manager
* component and auto fill credentials and attemp login
*/
class CredsManager {

  constructor(compName) {
    if (typeof compName !== 'string') {
      throw new Error('Please pass a valid name')
    }
    this.name = compName
    this.formConfig = new FormConfig(compName)
    this.loader = new Loader()
  }

  async login() {
    const manager = new ManagerLauncher()
    const managerRunning = await manager.isRunning().catch((error) => {
      // Looks like isRunning wasn't able to get describtors
      console.log(error)
    })

    if (!managerRunning) {
      await manager.open().catch((error) => {
        // couldn't spawn a new creds manager
        console.log(error)
      })
    }

    this.fields = await this.formConfig.get()
    .catch((error) => {
      console.log(error)
    })

    return new Promise((resolve, reject) => {
      if (!this.fields) {
        reject(new Error('No auto login support'))
        return
      }
      // If already logged in
      if (!this._elExists(this.fields.userInput)) {
        resolve('Logged in')
        return
      }
      // Show the loading layer
      this.loader.show()
      // Get credentials and attemp a login
      Router.query('creds',
      {name: this.name}, (error, res) => {
        if (!error) {
          this._login(res.data)
          resolve()
          return
        }
        this.loader.hide()
        reject(error)
      })
    })
  }
  // It does all stemps prior submission
  _login(creds) {
    this._autoFill(this.fields.userInput, creds.username)
    this._autoFill(this.fields.passInput, creds.password)
    this._submit()
  }

  _autoFill(name, val) {
    const input = document.getElementsByName(name)[0]
    input.setAttribute('value', val)
    return this
  }

  _elExists(name) {
    return document.getElementsByName(name)[0]
  }

  _submit() {
    document.forms[this.fields.formIndex].submit()
  }
}

module.exports = CredsManager
