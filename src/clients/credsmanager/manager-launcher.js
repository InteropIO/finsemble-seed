const Launcher = FSBL.Clients.LauncherClient
/**
* Allows us to check with creds manager is open
* if not, it allows us to spawn the manager component
*/
class ManagerLauncher {

  constructor() {
    this.componentName = 'Creds Manager'
  }
  /**
  * Spawn a new Creds manager component
  */
  open() {
    return new Promise((resolve, reject) => {
      Launcher.spawn(this.componentName, {}, (error, comp) => {
        if (!error) {
          // Ok, I don't know at what stage does FSBL call the cb
          // That's why I will delay this a bit..
          setTimeout(()=> resolve(comp), 500)
          return
        }
        reject(new Error(error))
      })
    })
  }
  /**
  * Checks whether the Creds Manager components
  * is open by retrieving the list of registered components
  */
  isRunning() {
    return new Promise((resolve, reject) => {
      // Descriptos was the only possible way to find out
      // Where a component is running or not
      Launcher.getActiveDescriptors((error, descriptors) => {
        let managerDescriptor = null
        for(const key in descriptors) {
          // If this is what we are looking for!
          if (descriptors[key].componentType === this.componentName) {
            resolve(descriptors[key])
            return
          }
        }
        if (error) {
          reject(new Error('Couldnt get list'))
          return
        }
        if (!managerDescriptor) {
          reject(new Error('Not running'))
          return
        }

      })
    })
  }
}

module.exports = ManagerLauncher
