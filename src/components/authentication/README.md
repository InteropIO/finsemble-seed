# Finsemble OAuth with PKCE recipe

This folder contains a Finsemble Authentication Component implementation for use with the OAuth Authorization code with PKCE flow.
It is meant as a starting point for you to build your own Authentication Component. See: 

- [_Authentication.tsx_](Authentication.tsx) for the example authentication component.
- [_oAuthPKCE.ts_](oAuthPKCE.ts) for functionality specific to OAuth and PKCE.
- [_RouterPubSubTools.ts_](RouterPubSubTools.ts) for utility functions for creating an accessed controlled PubSub topic to distribute credentials to only selected apps or domains.

Please note that: 
- [_oAuthPKCE.ts_](oAuthPKCE.ts) accesses Finsemble's `startup` auth configuration in [_/public/configs/application/config.json_](../../../public/configs/application/config.json) for the details needed to authenticate. 
- In this version of the recipe the auth component is treated as a single page application (may be restricted by allowed callback URL and/or web origin) and hence no client secret is used in the access token retrieval. To upgrade it to use a flow with a backchannel and a client secret, access token retrieval that should be performed on a server, replacing the token retrieval in [`oAuthPKCA.getToken()`](oAuthPKCE.ts) with a call to your server, which should handle the retrieval and return the token to you.
- If a refresh_token and expires_in value are returned with an access token, the example will attempt to refresh the access token automatically, ahead of expiry.
- Some assembly is required if you wish to control disribution of access tokens to other applications. Examples are provided in [_RouterPubSubTools.ts_](RouterPubSubTools.ts) for setting up an access controlled PubSub topic and in [_Authentication.tsx_](Authentication.tsx) for publishing to that topic.

See the [Finsemble Authentication tutorial](https://documentation.finsemble.com/tutorial-Authentication.html) for further details on how to work with Finsemble's authentication support.

**Note:** the recipe is preconfigured for an Auth0 zero account which is used for testing. Test login credentials:

- username: kris+oauthtest@cosaic.io
- password: testWithAuth0

**Note:** Log out is not implemented in this example. Hence, to clear the login session and reauthenticate:

- open the developer console on a trusted component
  - e.g. the Authentication component itself via Central logger, or Toolbar by clicking on it and hitting Ctrl + shift + i
- Then run:

  ```javascript
  FSBL.System.clearCache({appcache: false, cookies: true, localstorage: false});
  FSBL.System.restart();
   ```
