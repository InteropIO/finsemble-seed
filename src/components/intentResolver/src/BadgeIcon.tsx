import * as React from "react";

const BadgeIcon = ({ openAppCount }: { openAppCount: number }) =>
  openAppCount ?
    (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="SVGBadge-svg"
        viewBox="0 0 20 20"
      >
        <circle
          cx="10"
          cy="10"
          r="10"
          className="SVGBadge-svgBackground"
        ></circle>
        <text x="10" y="14.5" className="SVGBadge-number" textAnchor="middle">
          {openAppCount}
        </text>
      </svg>
    ) : null

export default BadgeIcon;