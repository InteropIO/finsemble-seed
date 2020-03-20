import * as React from "react";

export const If: React.FunctionComponent<{ condition: () => boolean }> = ({ children, condition }) => (
	<>
		{condition && condition()}
	</>
);
