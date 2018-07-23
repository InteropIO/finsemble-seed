const Store = FSBL.Clients.StorageClient
const Router = FSBL.Clients.RouterClient

/**
 * A little vue.js application to help with rendering
 * and UI interactions
 */
module.exports = (components) => {
  return new Vue({
    el: '#app',
    data: {
      passMismatch: false,
      list: components,
      selected: null,
      allCreds: [],
    },
    /**
     * Once the vue instancer created, get creds from
     * Storage using StorageClient and keep it in our memory
     */
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
      /**
       * Lets the vue app knows which entry are we adding
       * for so that we could render the form accordinly
       */
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
      /**
       * Saves the updated creds in storage and
       * updates the local copy
       */
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
      /**
       * Creates a Responder to queries sent from other components
       * requesting access to credentials for the requesting component
       */
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
