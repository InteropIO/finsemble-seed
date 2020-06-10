import * as React from "react";

interface Props {
	children: React.PropsWithChildren<any>;
	onBlur?: Function;
}

function Drawer(props: Props): React.ReactElement {
	return (
		<div id="drawer" onBlur={() => props.onBlur && props.onBlur()}>
			{props.children}
		</div>
	);
}

export default Drawer;
