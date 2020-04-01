export const injectCSS = (childWindow) => {
	const type = "text/css";
	const { children } = document.head;
	const styleElements = [];
	for (const item in children) {
		if (children[item].type === type) {
			/*
			Injecting parent window's style elements into
			the child head, removes them from the parent window
			and breaks its look. That is why I'm creating
			new elements, copying css and injecting the new elements
			*/
			const newElement = document.createElement("style");
			newElement.type = type;
			newElement.innerHTML = children[item].innerHTML;
			styleElements.push(newElement);
		}
	}
	styleElements.forEach((item) => {
		childWindow.document.head.append(item);
	})
}