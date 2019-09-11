const FSBLReady = () => {
    console.log("Finsemble Ready");

    FSBL.Clients.Logger.system.log("APPLICATION LIFECYCLE:STARTUP:Authorization Component Load");

    //Finsemble will never come online for the authentication component and we don't want to alarm anyone.
    // FSBL.displayStartupTimeoutError = false;
    function quit() {
        FSBL.shutdownApplication();
    }

    // In theory check whether we have a good session. In practice, just show the login dialog.
    function checkSession() {
        fin.desktop.Window.getCurrent().show();
    }

    //Add the config to the config service
    function updateConfig(config, cb) {
        FSBL.Clients.ConfigClient.processAndSet({
            newConfig: config,
            overwrite: true,
            replace: true
        }, cb);
    }

    //Tell authentication we're all good
    function acceptCredentials(user) {
        FSBL.Clients.Logger.system.log("APPLICATION LIFECYCLE:STARTUP:Authorization Component accept credentials");
        FSBL.Clients.AuthenticationClient.publishAuthorization(user.username, user);
        // FSBL.Clients.WindowClient.close( { removeFromWorkspace: false, closeWindow: true });
    }

    $('#password').keypress(function (e) {
        if (e.keyCode == 13)
            processAuthInput();
    });

    $('#authAction').click(function (e) {
        var text = "Login"
        var actionLink = "Login";
        $('#submitButton').html(text);
        $('#authAction').html(actionLink);
    });

    function displayErrorMessage() {
        fin.desktop.Window.getCurrent().show();
        var ERROR_MESSAGE = $('.fsbl-input-error-message');
        var INPUTS = $('.fsbl-auth-input');
        const INPUT_ERROR_CLASS = 'fsbl-input-error';

        INPUTS.addClass(INPUT_ERROR_CLASS);

        ERROR_MESSAGE.show();

        INPUTS.on('keydown', function () {
            INPUTS.removeClass(INPUT_ERROR_CLASS)
            ERROR_MESSAGE.hide();
        });
    }

    function processAuthInput() {
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;

        // real authentication might use BasicAuth, Digest Auth, or pass off to authentication server which redirects back when authenticated
        // below is a dummy example that sends an HTTP get with username and password to a serverl, then assumes authenticated when any responses is received

        var authUrl = "/login";
        var data = new FormData();
        data.append("credentials", JSON.stringify({ username: username, password: password }));
        fin.desktop.Window.getCurrent().hide();
        fetch(authUrl, {
            method: "POST",
            body: data,
            credentials: 'include'
        })
            .catch((reason) => {
                displayErrorMessage();
                console.warn("Fail Auth Get", reason);
            })
            .then((res) => {
                if (res.ok) { // dummy example -- if ok response then move on like authentication was successful
                    return res.json();
                } else {
                    displayErrorMessage();
                    console.warn("Auth Error", res);
                }
            })
            .then(data => {
                var credentials = { token: "dummyToken-abcdenfhij1234567890" }; // create dummy credentials
                updateConfig(data.config, function () {
                    acceptCredentials(data.user)
                });
            });
    }
    document.body.addEventListener('keydown', handleKeydown);
    function handleKeydown(e) {
        if (e.code === 'Enter' && e.shiftKey === false) {
            processAuthInput();
        }

        if (e.code === 'Escape') {
            quit();
        }
    }

    FSBL.Clients.Logger.system.log("APPLICATION LIFECYCLE:STARTUP:Authorization Component onReady");
    checkSession();

    // Add events to HTML elements
    $("#submitButton").click(processAuthInput);
    $("#FSBL-close").click(quit);
}

if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener("onReady", FSBLReady);
} else {
    window.addEventListener("FSBLReady", FSBLReady)
}
