import React from 'react'

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props)
    }

    componentWillMount() {
        console.log('Dashboard mounted')
    }

    // Create child components and use them below
    render(){
        return  <div>
            <h1>Dashboard Builder</h1>
            <ul>
                <li>item #1</li>
                <li>item #2</li>
                <li>item #3</li>
            </ul>
        </div>
    }
}