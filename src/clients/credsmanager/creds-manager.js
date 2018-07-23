const FormConfig = require('./form-config')
const Router = FSBL.Clients.RouterClient

/**
 * This client library could be used
 * In any component with mind control
 * to retrieve creds from the creds manager
 * component and attemps a login
 */
class CredsManager {

  constructor(compName) {
    if (typeof compName !== 'string') {
      throw new Error('Please pass a valid name')
    }
    this.formConfig = new FormConfig(compName)
    this.name = compName
  }

  async login() {
    const fields = await this.formConfig.get()
    .catch((error) => {
      console.log(error)
    })

    return new Promise((resolve, reject) => {
      if (!fields) {
        reject(new Error('No auto login support'))
        return
      }
      Router.query('creds', {name: this.name},
      (error, res) => {
        const data = res.data
        if (!error) {
          this._autoFill(fields.userInput, data.username)
          this._autoFill(fields.passInput, data.password)
          resolve(data)
        } else {
          reject(error)
        }
      })
    })
  }

  _autoFill(name, val) {
    const input = document.getElementsByName(name)[0]
    input.setAttribute('value', val)
    return this
  }
}

module.exports = CredsManager
