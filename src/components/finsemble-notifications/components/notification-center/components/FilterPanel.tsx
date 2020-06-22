import * as React from "react";
interface Props {
	children?: React.PropsWithChildren<any>;
	types: Array<string>;
}

const NotificationsPanel = (props: Props) => (
	<section id="notification-center__notification-filter-panel">
		<div>
			{props.types.map(
				type =>
					type && (
						<>
							<input key={type} type="checkbox" name={type} value={type} /> {type}
							<br />
						</>
					)
			)}
			<button>Filter</button>
		</div>
	</section>
);

export default NotificationsPanel;
