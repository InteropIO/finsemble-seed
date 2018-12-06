# Logging Export Service Example #

Simple log export service example which captures messages of specifed categories and levels and transmits them to a remote API in batch, once a certin batch size or timeout is reached.

The service will come up as soon as possible during finsemble startup - but will inevitably not be able to capture so of the earliest log messages.

## Setup and Customisation ##
In the enclosed _loggingexportService.js_ file, look for `//TODO:` comments which indicate where to customize the service to your needs - inline documentation is provided. In particular, you will need to set your `LOGGING_ENDPOINT` and customize the request format and payload to suit your remote log collection endpoint.

## Installation ##
1. Copy the enclosing directory to your seed project at: _/src/services/loggingexport_
so that you have files:
_/src/services/loggingexport/loggingexport.html_
_/src/services/loggingexport/loggingexportService.js_

Add the below service definition to the services element _/configs/application/services.json_ config file:
```
"loggingexportService": {
	"useWindow": true,
	"active": true,
	"name": "loggingexportService",
	"visible": false,
	"html": "$applicationRoot/services/loggingexport/loggingexport.html"
}
```

Run `npm run dev` to build and run finsemble.

