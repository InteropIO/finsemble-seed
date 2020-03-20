# Integrating Finsemble auth with Keycloak

This recipe intend to provide an example for integrating Keycloak with Finsemble as authentication part.
To use Keycloak, please download Keycloak from https://www.keycloak.org/downloads.html] and follow their instruction to start and configure Keycloak

To use Keycloak in Finsemble, the following should be added or modified.
- Manifest.json

You have to add `authentication` under `finsemble`

e.g.
"authentication": {
    "startup": {
        //Default adapter to use
        "adapter": "OAUTH2",
        // The authenication endpoint provided by Keycloak, for exact endpoint, please check your own Keycloak setting or their reference material
        "authorization_endpoint": "http://<-- Your Keycloak server address -->:<-- Your Keycloak server port -->/auth/realms/<-- You realm id -->/protocol/openid-connect/auth",
        "scope": "openid",
        // The Keycloak clientid you setup in Keylcoak
        "client_id": "<-- Your Keycloak client ID -->",
        // Your server API to handle the auth code sent from Keycloak to retrieve the access token
        // In this recipe the example code is in server/server.js
        "backchannel_endpoint": "<-- Your backchannel API-->",
        // The page should be redirected to after authenication
        // This page will then pass the auth code from keycloak to the backchannel endpoint
        "redirect_uri": "$applicationRoot/components/oauthRespone/oauthRespone.html",
        // The auth component                
        "component": "oauthRespone"
    }
}

- oauthResponse

This component is used to handle the auth code sent from Keycloak after correct authenication. 
The auth code will be sent to the backchannel endpoint by calling FSBL.Clients.AuthenticationClient.completeOAUTH() to retrieve the access token.
After that, you can add your own logic in the callback of runBusinessLogic() to setup your own credentials structure.

- backchannel_endpoint

This must be setup in your own server to handle the auth code sent from Keycloak.
In this recipe, you can find sample code in `server/server.js`. The auth code and relative parameters sent Keycloak will then be sent back to Keycloak's token endpoint to retrieve the acces token.

