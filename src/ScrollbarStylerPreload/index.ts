window.addEventListener("DOMContentLoaded", () => {
	const addCSS = (s) =>
		((d) => {
			d.head.appendChild(d.createElement("style")).innerHTML = s;
		})(document);
	addCSS(`
	/* Proposed standard for styling scrollbars. Not yet supported in 
		Webkit/Chrome/Electron but will be in the future.*/
	html, body {
		scrollbar-width: thin;
		scrollbar-color: #42a5ba #22262f
	}
	
	/* Vendor prefix styles currently supported by Webkit/Chrome/Electron.*/
	html::-webkit-scrollbar,body::-webkit-scrollbar {
		width: 12px;
	}
	
	html::-webkit-scrollbar-track,body::-webkit-scrollbar-track {
		background: #22262f;
	}
	
	html::-webkit-scrollbar-thumb,body::-webkit-scrollbar-thumb {
		background-color: #42a5ba;
		border-radius: 12px;
		border: 3px solid #36788b;
	}
    `);
});
