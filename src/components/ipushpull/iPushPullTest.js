import $ from "jquery";
import Cookies from 'js-cookie';
import {getUserDetails, getUserDocs, getLoginToken}  from './ipushpullTestClient';
const Logger = FSBL.Clients.Logger;
const cookie_prefix = 'ipp_test_symphony';

//check for ipp cookie, if not present set it and refresh
let access_token = Cookies.get(cookie_prefix + "_access_token");

const init= ()=>{
	console.log("Injection of File Occured");
	$(
		`<style>
			#paste-box{
				position: absolute;
				top: 10px;
			}
			.modal{
				position: absolute;
			}
		</style>`
		).appendTo( "head" );
	FSBL.Clients.WindowClient.setWindowTitle("iPushPull (Test)");
	if (!access_token) {
		getUserDetails(function(err, userDetails) {	
			if (err) {
				Logger.error("IPUSHPULL: Error retrieving user details!", JSON.stringify(err));
			} else {
				Logger.log("IPUSHPULL: Got user details: " + userDetails.email, err);
				getLoginToken({email: userDetails.email, password: userDetails.password}, function (err, response) {
					if (err) {
						Logger.error("IPUSHPULL: Error whilst logging in!", err);
					} else {
						Logger.log("IPUSHPULL: Login successful, response :" + JSON.stringify(response, undefined, 2));
					
						Cookies.set(cookie_prefix + "_access_token", response.access_token, { expires: 1, domain: '.ipushpull.com' });
						Cookies.set(cookie_prefix + "_refresh_token", response.refresh_token, { expires: 360, domain: '.ipushpull.com' });

						location.reload()
						// location.assign("https://test.ipushpull.com/embedded/integrations/finsemble/index.html?access=" + response.access_token + "&token=" + response.refresh_token);
					}
				});
			}
		});
	}

};

if (window.FSBL && FSBL.addEventListener) {
    FSBL.addEventListener('onReady', init);
} else {
    window.addEventListener('FSBLReady', init);
} 
