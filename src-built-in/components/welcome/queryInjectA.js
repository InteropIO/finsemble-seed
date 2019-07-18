fin.desktop.logger.error('Query inject A success');
FSBL.Clients.RouterClient.addResponder("someChannelName", function (error, queryMessage) {
    if (error) {
        Logger.system.log('addResponder failed: ' + JSON.stringify(error));
    } else {
        console.log("incoming data=" + queryMessage.data);
        var response = "Back at ya"; // Responses can be objects or strings
        queryMessage.sendQueryResponse(null, response); // The callback must respond, else a timeout will occur on the querying client.
    }
});