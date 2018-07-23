const Store = FSBL.Clients.StorageClient
const Router = FSBL.Clients.RouterClient

module.exports = (components) => {
  return new Vue({
    el: '#app',
    data: {
      passMismatch: false,
      list: components,
      selected: null,
      allCreds: [],
    },
    created: function () {
      Store.get({topic: 'cmanager', key:'entries' },
      (error, data = []) => {
        if (error) throw new Error(error)
        this.allCreds = data
      })
      // Setup query responder
      this._setup()
    },
    methods: {
      set:  function (config) {
        Store.get({topic: 'cmanager', key:'entries' },
        (error, data = []) => {
          if (error) throw new Error(error)
          data.forEach((item) => {
            if(item.name === config.name) {
              config.username = item.username
              config.password = item.password
              config.confirmPass = item.confirmPass
              this.selected = config
            }
          })
        })
      },
      save: function () {
        if (this.selected.password !== this.selected.confirmPass) {
          this.passMismatch = true
          return
        }
        Store.save({ topic: 'cmanager', key: 'entries',
        value: this.list}, (error) => {
          if (error) throw new Error(error)
          this.passMismatch = false
          this.selected = null
        })
      },
      _setup: function() {
        Router.addResponder('creds', (error, query) => {
          if (error) throw new Error(error)
          const creds = this.allCreds.filter((item) => {
            return item.name == query.data.name
          })[0]

          // We found the creds, lets send it
          if (creds) {
            query.sendQueryResponse(null, creds)
          } else {
            query.sendQueryResponse('Not found')
          }

        })
      }
    }
  })
}
