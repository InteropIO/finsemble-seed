module.exports = (components) => {
  return new Vue({
    el: '#app',
    data: {
      username: null,
      password: null,
      confirmPass: null,
      passMismatch: false,
      selected: null,
      list: components
    },
    methods: {
      set:  function (config) {
        this.selected = config
      },
      save: function () {
        if (this.password !== this.confirmPass) {
          this.passMismatch = true
          return
        }

      }
    }
  })
}
