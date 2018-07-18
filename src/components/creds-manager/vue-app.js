const Store = FSBL.Clients.StorageClient

module.exports = (components) => {
  return new Vue({
    el: '#app',
    data: {
      passMismatch: false,
      list: components,
      selected: null
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

    }
  })
}
