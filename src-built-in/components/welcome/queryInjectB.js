fin.desktop.logger.error('Query inject B success');
FSBL.Clients.RouterClient.query("someChannelName", {}, function (error, queryResponseMessage) {
    if (error) {
        Logger.system.log('query failed: ' + JSON.stringify(error));
    } else {
        // process income query response message
        var responseData = queryResponseMessage.data;
        fin.desktop.logger.error('Successfully received response Query / Respond');
        Logger.system.log('query response: ' + JSON.stringify(queryResponseMessage));
    }
});