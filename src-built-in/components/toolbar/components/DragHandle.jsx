import React from 'react';

const DragHandle = () => {
	return (
		<span className="cq-drag finsemble-toolbar-drag-handle">
			<svg viewBox="0 0 15 34" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g opacity="0.408315" filter="url(#filter0_d)">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M8 12H7V13H8V12ZM6 14H5V15H6V14ZM7 14H8V15H7V14ZM10 14H9V15H10V14ZM5 16H6V17H5V16ZM8 16H7V17H8V16ZM9 16H10V17H9V16ZM8 18H7V19H8V18ZM5 18H6V19H5V18ZM10 18H9V19H10V18ZM9 20H10V21H9V20ZM8 20H7V21H8V20ZM5 20H6V21H5V20ZM8 22H7V23H8V22Z" fill="white" />
				</g>
				<defs>
					<filter id="filter0_d" x="5" y="11" width="5" height="12" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
						<feFlood flood-opacity="0" result="BackgroundImageFix" />
						<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
						<feOffset dy="-1" />
						<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.138728 0" />
						<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
						<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
					</filter>
				</defs>
			</svg>
		</span>
	)
};

export default DragHandle;