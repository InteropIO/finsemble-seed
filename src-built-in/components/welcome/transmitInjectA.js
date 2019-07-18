fin.desktop.logger.error('Transmit inject A success');
FSBL.Clients.RouterClient.addListener('SomeChannelName', function (err, message) {
    fin.desktop.logger.error('Successfully received response from Transmit / Listen');
});