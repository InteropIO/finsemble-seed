(() => {
	const Vue = window.Vue

	FSBL.addEventListener('onReady', initializeApp)

	function initializeApp() {
		new Vue({
			el: '#app'
		})

	}

})()
