/**
 * Reusable functions to perform animations.
 */
 export default {
    animateFolder
 }
 /**
  * 
 * @param {element} element  The folder's item in the list
 * @param {number} counts How many times to flash
  * @param {number} speed How fast to flash bgcolor in ms
  */
function animateFolder(element, counts = 4, speed = 100) {
    const parent = element.parentElement.parentElement
    let flash = false
    let counter = 0
    let timer = setInterval(() => {
        if (counter <= counts) {
            parent.style.backgroundColor = !flash ? '#97b4cf' : ''
            counter += 1
            flash = !flash
            return
        }
        clearInterval(timer)
        parent.style.backgroundColor = ''
    }, speed)
}
