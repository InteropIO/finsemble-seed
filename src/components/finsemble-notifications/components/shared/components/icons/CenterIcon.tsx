import * as React from "react";
import SVGBase, { SVGProps } from "./SVGBase";

export default function CenterIcon(props: SVGProps) {
	return (
		<SVGBase
			{...props}
			fill="white"
			d="M2 5V19H8V5H2ZM9 5V10H15V5H9ZM16 5V14H22V5H16ZM9 11V19H15V11H9ZM16 15V19H22V15H16Z"
		/>
	);
}
