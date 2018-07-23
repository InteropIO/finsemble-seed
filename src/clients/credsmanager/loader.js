/**
* A tiny class to hide contents and
* display a white overlay with
* a text message
*/
class Loader {

  /**
  * Create a div elemnt with text insider
  */
  constructor () {
    this._div = document.createElement('div')
    this._div.innerText = 'Logging in...'
    this._setStyles()
    this._inject()
  }
  /**
  * Shows the div by setting css display:block
  */
  show() {
    this._div.style.display = 'block'
  }
  /**
  * Hides the div by setting css display:block
  */
  hide() {
    this._div.style.display = 'none'
  }
  /**
  * Appends the div to the container DOM
  */
  _inject() {
    document.body.appendChild(this._div)
  }
  /**
  * Sets the necessary css properties
  */
  _setStyles() {
    this._div.setAttribute('style',
    ` width: 100%;
    height: 100%;
    padding-top: 15%;
    display: none;
    background: #fff;
    text-align: center;
    position: absolute;
    z-index: 3001;
    top: 0;
    left: 0;
    `)
  }
}

module.exports = Loader
