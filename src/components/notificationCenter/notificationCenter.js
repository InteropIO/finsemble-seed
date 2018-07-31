FSBL.addEventListener('onReady', function () {

	FSBL.Clients.RouterClient.addListener("notificationCenter.toggle", function (error, response) {
        if (error) {
            Logger.system.log('notificationCenter toggle error: ' + JSON.stringify(error));
        } else {
            let window = FSBL.Clients.WindowClient.getCurrentWindow();        
            window.isShowing(function(showing) {
                if(showing){
                    window.hide();
                } else {
                    window.show(); //assumes window is already positioned correctly, if not then use LauncherClient.showWindow instead
                }
            });
        }
    });

});