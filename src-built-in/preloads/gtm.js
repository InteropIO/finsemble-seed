/*
	Google Tag Manager Preload
	==========================
	Google Tag Manager can track:
	- page views (these are the component views / windows)
	- element interactions - button clicks
	- javascript errros
	and more

	The three actions listed above need no extra code and can be done via GTM directly.

	Once integrated with GTM it is best to use Google Analatics but alternatives can be used.
*/

const gtmID = "GTM-55JT28T";

const startGoogleTagManager = () => {
	// includes the GTM script dynamically
	// n.b. this is the recommended approach rather than using webpack require or import
	// ensuring that you are using the most current GTM version

	window.dataLayer = window.dataLayer || [];

	(function(w, d, s, l, i) {
		w[l] = w[l] || [];
		w[l].push({
			"gtm.start": new Date().getTime(),
			event: "gtm.js"
		});
		var f = d.getElementsByTagName(s)[0],
			j = d.createElement(s),
			dl = l != "dataLayer" ? "&l=" + l : "";
		j.async = true;
		j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
		f.parentNode.insertBefore(j, f);
	})(window, document, "script", "dataLayer", gtmID);
};

// add gtm as early as possible
window.addEventListener("DOMContentLoaded", event => {
	startGoogleTagManager();
});
