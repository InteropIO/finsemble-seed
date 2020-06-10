import * as React from "react";
import SVGBase, { SVGProps } from "./SVGBase";

export default function DragHandleIcon(props: SVGProps) {
	return (
		<SVGBase
			{...props}
			width="8"
			height="15"
			viewBox="0 0 5 11"
			opacity="0.408315"
			fillRule="evenodd"
			clipRule="evenodd"
			d="M3 0H2V1H3V0ZM1 2H0V3H1V2ZM2 2H3V3H2V2ZM5 2H4V3H5V2ZM0 4H1V5H0V4ZM3 4H2V5H3V4ZM4 4H5V5H4V4ZM3 6H2V7H3V6ZM0 6H1V7H0V6ZM5 6H4V7H5V6ZM4 8H5V9H4V8ZM3 8H2V9H3V8ZM0 8H1V9H0V8ZM3 10H2V11H3V10Z"
			fill="white"
		/>
	);
}
