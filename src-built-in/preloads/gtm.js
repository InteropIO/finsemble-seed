/*
	Google Tag Manager Preload
*/

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
	})(window, document, "script", "dataLayer", "GTM-55JT28T");
};

window.addEventListener("DOMContentLoaded", event => {
	startGoogleTagManager();
});
