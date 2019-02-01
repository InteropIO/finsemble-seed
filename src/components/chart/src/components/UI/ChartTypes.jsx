/**
 * Chart type selection menu
 * @module components/UI/ChartTypes
 */

import React from 'react'
import configs from "../../../configs/ui.js";
import MenuSelect from '../shared/MenuSelect'

/**
 * Chart type selection menu component
 *
 * @param {Object} props
 */
const ChartTypes = (props) => {
	let selected = configs.chartTypes.types.find((ct)=> ct.type==props.chartType)
	return (
		<MenuSelect
			options={configs.chartTypes.types}
			keyName='type'
			name='label'
			handleOptionSelect={props.setChartType}
			menuId='chartTypeSelect'
			title='Chart Type'
			hasCheckboxes={true}
			selected={selected} />
	);
}

export default ChartTypes
