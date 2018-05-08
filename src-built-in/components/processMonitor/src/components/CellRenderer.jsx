import { bytesToSize } from "../helpers";
import React from "react";
import { round } from "../helpers";
import { NOT_A_METRIC, NOT_RIGHT_ALIGNED, CPU_HEADER, MEMORY_HEADER, HIGH_CPU, MODERATE_CPU_USAGE, MODERATE_MEMORY_USAGE, HIGH_MEMORY_USAGE, TO_MB } from "../constants";



export default function CellRenderer(cellData) {
    let classes = "";
    let val = cellData.value;
    let colHeader = cellData.column.Header.toLowerCase().replace(" ", "");

    //This syntax is confusing, but it's here so that we don't have to know _every_ column that exists. If the cell isn't right-aligned, add the class that right-aligns it.
    if (!NOT_RIGHT_ALIGNED.includes(colHeader)) {
        classes += " value-cell";
    }
    if (colHeader == CPU_HEADER) {
        if (val > HIGH_CPU) {
            classes += " high-usage"
        } else if (val > MODERATE_CPU_USAGE) {
            classes += " moderate-usage"
        }
        val = round(val, 2) + "%";
    } else if (!NOT_A_METRIC.includes(colHeader)) {
        if (colHeader === MEMORY_HEADER) {
            if (val > HIGH_MEMORY_USAGE * TO_MB) {
                classes += " high-usage"
            } else if (val > MODERATE_MEMORY_USAGE * TO_MB) {
                classes += " moderate-usage";
            }
        }
        val = bytesToSize(cellData.value);
    }

    return <div key={cellData.accessor} style={{ height: "25px" }} className={classes}>
        {val}
    </div>
}