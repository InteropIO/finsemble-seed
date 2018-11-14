import React from 'react'

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            filter: ""
        }
    }

    componentWillMount() {
        console.log('Dashboard mounted')
    }

    // Create child components and use them below
    render() {
        return (
            <div className="container">
                <div>
                    <img src="search-white.png" className="search_white" />
                    <input type="text" placeholder="filter" className="" onChangeText={(filter) => this.setState({ filter })} STYLE='color:#FFFF00' />
                </div>
                <hr className="line" />
                <div>
                    <div className="imageDivGroup">
                        <p draggable id="1" data="bye" onDragStart={(e) => e.dataTransfer.setData('text/plain', 1)} className="componentText"><i className="fas fa-chart-line" /> Advanced Chart</p>
                    </div>
                    <div className="imageDivGroup">
                        <p draggable id="2" data="bye" onDragStart={(e) => e.dataTransfer.setData('text/plain', 2)} className="componentText"><i className="fas fa-chart-line" /> Financials</p>
                    </div>
                    <div className="imageDivGroup">
                        <p draggable id="3" data="bye" onDragStart={(e) => e.dataTransfer.setData('text/plain', 3)} className="componentText"><i className="fas fa-chart-line" /> News</p>
                    </div>
                </div>
            </div>
        )
    }
}