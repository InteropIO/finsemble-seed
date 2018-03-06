# Extending server functionality

Sample _server-extensions.js_:
```javascript
((module) => {
    "use strict";
    
    module.exports = {
        /**
         * Method called before starting the server.
         */
        pre: () => { console.log("pre server startup"); },

        /**
         * Method called after the server has started.
         */
        post: () => { console.log("post server startup"); },

        /**
         * Method called to update the server.
         * 
         * @param {express} app The express server.
         * @param {function} cb The function to call once finished adding functionality to the server.
         */
        updateServer: (app, cb) => { console.log("modifying server"); cb(); }
    }
})(module);
```