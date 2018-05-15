import React from "react";
import CellRenderer from "./CellRenderer";
import { toProperCase, bytesToSize, round } from "../helpers";
import { statsWeCareAbout, NOT_A_METRIC } from "../constants";
const VALUES = statsWeCareAbout.filter(stat => !NOT_A_METRIC.includes(stat.toLowerCase()));
export default function Totals(props) {
    let { data } = props;
    let formattedData = VALUES.map(stat => {
        return {
            label: toProperCase(stat),
            value: stat === "cpuUsage" ? round(data[stat], 2) + "%" : bytesToSize(data[stat])
        }
    });

    return <div className="totals-wrapper">
        <div className="totals-label">Totals</div>
        <div className="totals">
            {formattedData.map(data => {
                return (
                    <span>
                        <div className="total-label">
                            {data.label}
                        </div>
                        <div className="total-value">
                            {data.value}
                        </div>
                    </span>
                )
            })}
        </div>
    </div>
}