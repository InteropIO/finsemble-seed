# Finsemble OAuth with PKCE recipe

This folder contains a Finsemble Authentication Component implementation for use with the OAuth Authorization code with PKCE flow.
It is meant as a starting point for you to build your own Authentication Component. See the [_oAuthPKCE.ts_](oAuthPKCE.ts) file for functionality specific to OAuth and PKCE.

Please note that [_oAuthPKCE.ts_](oAuthPKCE.ts) accesses Finsemble's `startup` auth configuration in [_/public/configs/application/config.json_](../../../public/configs/application/config.json) for the details needed to authenticate. Please note that in this version of the recipe the auth component is treated as a single page application (may be restricted by allowed callback URL and/or web origin) and hence no client secret is used in the access token retrieval. To upgrade it to use server flow, with a client secret protecting the access token retrieval that should be performed on the server, replace the token retrieval in [`oAuthPKCA.getToken()`](oAuthPKCE.ts) with a call to your server, which should handle the retrieval and return the token to you.

See the [Finsemble Authentication tutorial](https://documentation.finsemble.com/tutorial-Authentication.html) for further details on how to work with Finsemble's authentication support.

**Note:** the recipe is preconfigured for an Auth0 zero account which is used for testing. Test login credentials:

- username: kris+oauthtest@cosaic.io
- password: testWithAuth0

**Note:** Log out is not implemented in this example. Hence, to clear the login session and reauthenticate:

- open the developer console on a trusted component
  - e.g. the Authentication component itself via Central logger, or Toolbar by clicking on it and hitting Ctrl + shift + i
- Then run:

  ```
  FSBL.System.clearCache({appcache: false, cookies: true, localstorage: false});
  FSBL.System.restart();
   ```
