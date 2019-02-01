/**
 * StudyUI for adding studies to the chart
 * @module components/UI/StudyUI
 */

import React from 'react'
import OverlayMenu from './OverlayMenu';
import StudyModal from '../Modals/StudyModal/StudyModal';
import MenuSelect from '../shared/MenuSelect'

/**
 * StudyUI for adding studies to the chart
 *
 * @class StudyUI
 * @extends {React.Component}
 */
class StudyUI extends React.Component{
	constructor(props){
		super(props);
	}
	render(){
		let tempStudies = [];

		Object.keys(this.props.studyList).map((key) => {
			if (this.props.studyList.hasOwnProperty(key)){
				tempStudies.push(this.props.studyList[key]);
			}
		});

		tempStudies.sort((a, b) => {
			if (a.name.toLowerCase() > b.name.toLowerCase()) { return 1; }
			else if (b.name.toLowerCase() > a.name.toLowerCase()) { return -1; }
			else { return 0; }
		});

		return (
			<span>
				<OverlayMenu {...this.props} />
				<StudyModal {...this.props} />

				<MenuSelect hasButtons={false}
						options={tempStudies}
						keyName='study'
						name='name'
						handleOptionSelect={this.props.addStudy}
						needsCiq={true}
						ciq={this.props.ciq}
						menuId='studySelect'
						title='Studies' />
			</span>
		);
	}
}

export default StudyUI;
