import * as React from "react";
const { useState, useEffect } = React;

interface Props {
	children?: React.PropsWithChildren<any>;
	displayDuration?: number;
	animateIn?: string;
	animateOut?: string;
	animateOutComplete?: Function;
}
/**
 * Animate the child component
 * props have default values attached in the component
 * @param props
 */
export default function Animate(props: Props) {
	// provide some defaults to ensure it still works even though it is blank
	const {
		animateIn,
		animateOut,
		displayDuration,
		animateOutComplete = () => {
			"";
		}
	} = props;
	const [css, setCSS] = useState(animateIn || "");

	useEffect(
		() => {
			let timer1: NodeJS.Timeout | undefined;
			if (props.displayDuration) {
				timer1 = setTimeout(() => {
					animateOut && setCSS(animateOut);
				}, displayDuration);
			}

			// this will clear Timeout when component unmount like in willComponentUnmount
			return () => {
				timer1 && clearTimeout(timer1);
				animateOut && setCSS(animateOut);
			};
		},
		[animateOut, displayDuration, props.displayDuration]
		// eslint-disable-line
		//useEffect will run only one time
		//if you pass a value to array, like this [data] than clearTimeout will run every time this value changes (useEffect re-run)
	);

	const hideChildElement = () => {
		css === animateOut && animateOutComplete();
	};

	return (
		<div className={css} onAnimationEnd={hideChildElement}>
			{props.children}
		</div>
	);
}
