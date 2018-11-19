import React from 'react'


export default class Dashboard extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            filter: "",
            draggables: ['Advanced Chart', 'Financials', 'News']
        }
    }
    createDragSources = (componentName) => {
        console.log(componentName)
        myLayout.registerComponent('example', function (container, state) {
            container.getElement().html('<h2>' + componentName + '</h2>');
        });
        var newItemConfig = {
            title: title,
            type: 'component',
            componentName: 'example',
            componentState: { text: text }
        };

        myLayout.createDragSource(element, newItemConfig);
    }
    getDraggables = () => {
        let drags = []
        this.state.draggables.forEach(value => {
            drags.push(<div className="imageDivGroup">
                <p draggable id={value} data="bye" onDragStart={(e) => e.dataTransfer.setData('text/plain', '${value}')} className="componentText"><i className="fas fa-chart-line" />{value}</p>
            </div >)
        })
        setTimeout(() => {
            drags.forEach(v => this.createDragSources(v))
        }, 1);
        return drags
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
                    {/* <input type="text" placeholder="filter" className="filterText" onChangeText={(filter) => this.setState({ filter })} STYLE='color:#FFFF00' /> */}
                </div>
                <hr className="line" />
                <div>
                    {this.getDraggables()}
                    {/* <div className="imageDivGroup">
                        <p draggable id="Financials" data="bye" onDragStart={(e) => e.dataTransfer.setData('text/plain', 'Financials')} className="componentText"><i className="fas fa-chart-line" /> Financials</p>
                    </div>
                    <div className="imageDivGroup">
                        <p draggable id="News" data="bye" onDragStart={(e) => e.dataTransfer.setData('text/plain', 'News')} className="componentText"><i className="fas fa-chart-line" /> News</p>
                    </div> */}
                </div>
            </div>
        )
    }
}