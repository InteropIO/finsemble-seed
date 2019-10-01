## Scheduled Shutdown Example ##
Some organizations shutdown or restart their machines at specified times of the week to ensure updates etc. are deployed. It can be advantageous to have Finsemble shutdown prior to that, particularly for native components that need to save state (and don't use Finsemble's proactive approach to state saving). This recipe provides a service that reads config for when to shutdown and implements the shutdown with a 60 second countdown dialog and workspace save.

### Installation ###

### Usage ###

