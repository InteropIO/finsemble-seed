# Setup

- Install a web server (e.g. apache or something) that can serve files
- Copy these files to the web server root
- switch to the finsembleBrowserMode branch of finsemble
- link the dist folders of finsemble and finsemble-seed:

`C:\wamp64\www\finsembleBrowser>mklink /D finsemble c:\Users\Sidd\Documents\GitHub\finsemble\dist`

`C:\wamp64\www\finsembleBrowser>mklink /D finsemble-seed c:\Users\Sidd\Documents\GitHub\finsemble-seed\dist`

- Go to localhost/index.htm or whatever your URL of the index file is

# Current Issues
- The global pubsub responder often does not work so the system fails to start. This can be solved by putting a breakpoint on the line where it is created in the routerservice and hitting continue.