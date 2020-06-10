import * as React from "react";
import SearchIcon from "../../shared/components/icons/SearchIcon";

interface Props {
	children: React.PropsWithChildren<any>;
	title: string;
}

const NotificationCenter = (props: Props) => {
	const { title } = props;
	return (
		<div id="notification-center">
			<header id="notification-center__header">
				<h1>{title}</h1>
				<div id="notification-center__search">
					<SearchIcon />
					<input />
				</div>
			</header>
			<main>{props.children}</main>
		</div>
	);
};

export default NotificationCenter;
