import React from  'react'

export default class FoldersList extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		return (
			<ul>
			{
				this.props.list.map((item, index) => {
					return <li onClick={() => this.props.onFolderClicked(item)} key={index}>{item.name}</li>
				})
			}
			</ul>
			)	
	}
}