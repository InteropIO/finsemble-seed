/***************************
* UserList Component
***************************/

var UserList = React.createClass({
    getInitialState: function () {
        return {
            users: [
                { name: 'Jackson Turner', street: '217 Tawny End', img: 'men_1.jpg' },
                { name: 'Megan Perry', street: '77 Burning Ramp', img: 'women_1.jpg' },
                { name: 'Ryan Harris', street: '12 Hazy Apple Route', img: 'men_2.jpg' },
                { name: 'Jennifer Edwards', street: '33 Maple Drive', img: 'women_2.jpg' },
                { name: 'Noah Jenkins', street: '423 Indian Pond Cape', img: 'men_3.jpg' }
            ]
        };
    },
    onDrop: function () {
        console.log('hello')
    },
    render: function () {
        var eventHub = this.props.glEventHub;
        return (
            <div onDrop={this.onDrop}>
                <ul className="userlist">
                    {this.state.users.map(function (user) {
                        return <User
                            key={user.name}
                            userData={user}
                            glEventHub={eventHub} />
                    })}
                </ul>
            </div>
        )
    }
});

/***************************
* User Component
***************************/
var User = React.createClass({
    getInitialState: function () {
        return this.props.userData;
    },
    selectUser: function () {
        this.props.glEventHub.emit('user-select', this.state);
    },
    render: function () {
        return (
            <li onClick={this.selectUser}>{this.state.name}</li>
        )
    }
});

/***************************
* UserDetail Component
***************************/
var UserDetail = React.createClass({
    componentWillMount: function () {
        this.props.glEventHub.on('user-select', this.setUser);
    },
    componentWillUnmount: function () {
        this.props.glEventHub.off('user-select', this.setUser);
    },
    setUser: function (userData) {
        this.setState(userData);
    },
    render: function () {
        if (this.state) {
            var imgUrl = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/152047/' + this.state.img;
            return (
                <div className="userdetails">
                    <img src={imgUrl} width="100" height="100" />
                    <h2>{this.state.name}</h2>
                    <p>{this.state.street}</p>
                </div>
            )
        } else {
            return (<div className="userdetails">No user selected</div>)
        }
    }
});

/***************************
* GoldenLayout Init
***************************/


import React, { Component } from 'react'

export default class Drag extends Component {
    constructor(props) {
        super(props)
        this.state = {
            config: {
                content: [{
                    type: 'row',
                    content: [
                        //     {
                        //     title: 'Users',
                        //     type: 'react-component',
                        //     component: 'user-list'
                        // }, {
                        //     title: 'User Detail',
                        //     type: 'react-component',
                        //     component: 'user-detail'
                        // }
                    ]
                }]
            },
            myLayout: null
        }
    }
    componentDidMount = () => {
        // this.setState({ myLayout: new GoldenLayout(this.state.config) })
        var config = {
            content: [{
                type: 'row',
                content: [
                    //     {
                    //     title: 'Users',
                    //     type: 'react-component',
                    //     component: 'user-list'
                    // }, {
                    //     title: 'User Detail',
                    //     type: 'react-component',
                    //     component: 'user-detail'
                    // }
                ]
            }]
        }
        try {
            var myLayout = new GoldenLayout(this.state.config)

            // myLayout.registerComponent('user-list', UserList);
            // myLayout.registerComponent('user-detail', UserDetail);
            myLayout.init();
        } catch (e) {
            console.log('error right here:', e)
        }
        this.setState({ myLayout })
    }

    onDrop = (ev) => {
        let compName = Math.random() * (100 - 1) + 0;
        this.state.myLayout.registerComponent(parseInt(compName, 10) + "test", function (container, state) {
            container.getElement().html('<h2>' + state.text + '</h2>');
        });

        console.log(parseInt(compName, 10))
        console.log(ev.target)
        let id = ev.dataTransfer.getData('text')
        console.log(id)
        var newItemConfig = {
            type: 'component',
            componentName: parseInt(compName, 10) + "test",
            componentState: { text: 'hello' }
        };
        console.log(this.state.myLayout)
        this.state.myLayout.root.contentItems[0].addChild(newItemConfig)

    }
    render() {
        return (
            <div onDrop={e => this.onDrop(e)}>
                hello

            </div>
        )
    }
}
