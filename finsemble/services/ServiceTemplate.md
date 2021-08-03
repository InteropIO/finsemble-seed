\*\*\* See storageService for a template.

Notes

1. Endpoints inside of `createRouterEndpoints` should be grouped by endpoint type, and then alphabetized. All listeners
   go together, then responders, then pub/sub responders. Remember that this isn't so that the code makes sense to the
   guy who wrote it, it's to help someone unfamiliar with the code jump in and quickly understand what's going on.
2. Router handlers should modify the incoming message (if necessary), and pass off any input into a member function.
   When the member function is done, the router handler will interface directly with the router. If the member function
   is big, hard to follow, and does async things, you should consider using async/await. In some cases this complicates
   rather than simplifies the code, so use your discretion. Ask another dev if you're concerned.
3. `initialize` should be the first member function.
4. `createRouterEndpoints` should be the second member function.
5. `bindCorrectContext` should be the third member function (if it's necessary).
6. Member functions should be alphabetized, but getters and setters should be grouped. (e.g., Dingle, Eagle, Roger,
   getStore, setStore, Truck).
7. Put a global reference to the service on the window at the bottom of your file for quick debugging.
8. Document each function. Include a description, and document the parameters that are passed in.
9. _Logging_

   - `error`: Should be obvious.

   - `warn`: More contentious, but do your best. Generally, a warning for something that's wrong but not
     system-critical. "Hey you shouldn't do this."

   - `log`: Used for lifecycle notifications. E.g., Workspace load, window close, etc. If you aren't sure if it counts
     as the application lifecycle, ask two other people to weigh in.

   - `info`: Each entry point into the API should have `Logger.system.info(SERVICE_NAME.METHOD_NAME, description,
     pertinentFunctionInput). Data should only be included if necessary.

   - `debug`: Put debug messages around areas that you're likely to need to look at to solve problems later.

   - `verbose`: Only the most egregious logs go here. E.g., assimilation/docking move events. Router client messages,
     etc.

Client-side

1. Queries and transmitters should be wrapped in client functions. Only query/transmit from one place.
