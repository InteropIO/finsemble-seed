fin.desktop.logger.error('Publish inject A success');
function subscribeCallback(error, subscribe) {
    if (subscribe) {
        // must make this callback to accept or reject the subscribe (default is to accept). First parm is err and second is the initial state
        subscribe.sendNotifyToSubscriber(null, { "NOTIFICATION-STATE": "One" });
    }
}
function publishCallback(error, publish) {
    fin.desktop.logger.error('Successfully received response Pub / Sub');
    if (publish) {
        // must make this callback to send notify to all subscribers (if error parameter set then notify will not be sent)
        publish.sendNotifyToAllSubscribers(null, publish.data);
    }
}
function unsubscribeCallback(error, unsubscribe) {
    fin.desktop.logger.error('unsubscribeCallback');
    if (unsubscribe) {
        // must make this callback to acknowledge the unsubscribe
        unsubscribe.removeSubscriber();
    }
}
FSBL.Clients.RouterClient.addPubSubResponder("topicABC", { "State": "start" },
{
    subscribeCallback: subscribeCallback,
    publishCallback: publishCallback,
    unsubscribeCallback: unsubscribeCallback
});