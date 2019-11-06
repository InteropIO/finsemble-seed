let inLogin = true;
/************************************************
 * 			SAMPLE AUTHENTICATION
 ************************************************/
// On ready, check to see if the user has a valid session
if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener("onReady", checkAuthorizationStatus);
    document.querySelector('button').addEventListener('click', (e) => {
        console.log('restart');
        FSBL.restartApplication();
    });
} else {
	window.addEventListener("FSBLReady", checkAuthorizationStatus);
}

$('#authAction').click( (e) => {
    const text = inLogin ? 'Sign Up' : 'Login';
    const actionLink = inLogin ? 'Login' : 'Sign Up';
    inLogin = !inLogin;
    $('#submitButton').html(text);
    $('#authAction').html(actionLink);
});

document.body.addEventListener('keydown', handleKeydown);

// Submits credentials on enter, closes on quit.
function handleKeydown(event) {
    switch (event.code) {
        case 'Enter':
        case 'NumpadEnter':
            !event.shiftKey &&
                processAuthInput();
            break;
        case 'Escape':
            quit();
            break;
    }
}

//Here, you may want to hit a server and request the user's session information. If the session is valid, log them in automatically. This sample code assumes that they are not logged in and just shows the authentication page.
function checkAuthorizationStatus() {

    FSBL.System.Window.getCurrent().show();

    FSBL.Clients.RouterClient.onReady((err, response) => {
        FSBL.Clients.RouterClient.addListener('Migration', (err, response) => {
            if (!err) {
                switch(response.data.topic) {
                    case 'migrationSuccessful':
                        document.querySelector('.notification').classList.add('hidden');
                        document.querySelector('.success').classList.remove('hidden');
                        break;
                    case 'migrationStatus':
                        if (response.data.status === false) {
                            console.log('migration needed');
                            document.querySelector('.form-wrapper').classList.add('hidden');
                            document.querySelector('.notification').classList.remove('hidden');
                        } else {
                            console.log('migration not needed');
                            FSBL.Clients.WorkspaceClient.initialize();
                        }
                        break;
                }
            }
        });
    });

    /*var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    // real authentication might use BasicAuth, Digest Auth, or pass off to authentication server which redirects back when authenticated
    // below is a dummy example that just accepts credentials from the form and publishes them out.
    var data = { username: username, password: password };

    publishCredentials(data);
    FSBL.System.Window.getCurrent().hide();*/
}

//Dummy function that just dumbly accepts whatever is in the form.
function processAuthInput() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    // real authentication might use BasicAuth, Digest Auth, or pass off to authentication server which redirects back when authenticated
    // below is a dummy example that just accepts credentials from the form and publishes them out.
    var data = { username: username, password: password };
    //FSBL.Clients.StorageClient.setUser({ user: username }, (err, response) => {
      //  console.log('set user', data, response)
        //checkMigrationStatus(data);
        publishCredentials(data);
        FSBL.System.Window.getCurrent().hide();
    //});
    //FSBL.System.Window.getCurrent().hide();


    //FSBL.Clients.WindowClient.finsembleWindow.hide();
    //In the real world, you'd get this from a server. Send joe's credentials to a server, and get back entitlements/basic config. For this example, we just accept the credentials.
}

//Pass credentials to the application.
function publishCredentials(user) {
    FSBL.Clients.AuthenticationClient.publishAuthorization(user.username, user);
}

//CLose app when the X is clicked.
function quit() {
    FSBL.shutdownApplication();
}

// Add events to HTML elements
$("#submitButton").click(processAuthInput);
$("#FSBL-close").click(quit);

// For this example, the password doesn't do anything, so we are disabling it and setting a tooltip to let the user
// know they don't need to enter a password. This should be removed in a production implementation.
$("#password")
    .prop("disabled", true)
    .prop("placeholder", "Demo needs no password");