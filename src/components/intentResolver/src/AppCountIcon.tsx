import * as React from "react";

function AppCountIcon(props: any) {
	return (
		<div className="app__count-icon">
			<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
				<path
					d="M21.484 11.125l-9.022-5a1 1 0 00-.968-.001l-8.978 4.96a1 1 0 00-.003 1.749l9.022 5.04a.994.994 0 00.973.001l8.978-5a1 1 0 00-.002-1.749zm-9.461 4.73l-6.964-3.89 6.917-3.822 6.964 3.859-6.917 3.853z"
					fill="#BE38ED"
				/>
				<path
					d="M12 22c.17 0 .337-.043.485-.126l9-5-.971-1.748L12 19.856l-8.515-4.73-.971 1.748 9 5c.149.083.316.126.486.126z"
					fill="#BE38ED"
				/>
			</svg>
			<span>{props.openAppCount}</span>
		</div>
	);
}

export default AppCountIcon;
