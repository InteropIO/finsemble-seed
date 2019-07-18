fin.desktop.logger.error('Publish inject B success');
FSBL.Clients.RouterClient.publish("topicABC", { test: 'publish a message'});