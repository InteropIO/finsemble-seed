export default class TestComponent extends HTMLElement {
	constructor() {
		super()
		this.activeMenuStack=[]
		this.registeredForResize=[]
	}


}

customElements.define('test-component', TestComponent)

