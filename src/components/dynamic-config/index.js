const form = document.forms.configs

FSBL.Clients.RouterClient.onReady(() => {
  // Get the current configurations from localstorage
  initialize()
  // Attach events
  form.addEventListener('submit', saveHandler)
})

function saveHandler() {
  const formData = new FormData(form)
  const configs = {}
  try {
    configs.components = JSON.parse(formData.get('comps'))
    configs.menus = JSON.parse(formData.get('menus'))
    configs.cssOverridePath = formData.get('cssOverridePath')
  } catch (e) {
    alert('Invalid input.')
    return
  }

  FSBL.Clients.StorageClient.save({
      topic: 'user',
      key: 'config',
      value: configs
    }, () => alert('Saved.'))
}

function initialize() {
  FSBL.Clients.StorageClient.get({
      topic: 'user',
      key: 'config'},
	  (error, data) => {
		  if (data) {
			  form.elements.comps.value = JSON.stringify(data.components) || ''
			  form.elements.menus.value = JSON.stringify(data.menus) || ''
			  form.elements.cssOverridePath.value = data.cssOverridePath || ''
		  }
      })
}
