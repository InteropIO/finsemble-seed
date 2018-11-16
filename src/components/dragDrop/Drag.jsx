

import React from "react";
import ReactDOM from 'react-dom'
import "./dragDrop.css";
/***************************
* GoldenLayout Init
***************************/
var myLayout = new GoldenLayout({
    content: [{
        type: 'row',
        content: [{
            title: 'Users',
            type: 'react-component',
            component: 'user-list'
        }, {
            title: 'User Detail',
            type: 'react-component',
            component: 'user-detail'
        }]
    }]
})



// FSBL.addEventListener("onReady", function () {
export default class Drag extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            moving: 0
        }
    }
    // mouseup = () => {
    //     console.log('mouseUp:', this.target)
    //     window.removeEventListener('mousemove', this.divMove, true);
    // }
    // mousedown = () => {
    //     console.log('mousedown:', this.target)
    //     window.addEventListener('mousemove', this.divMove, true);
    // }
    // divMove = (e) => {
    //     console.log('divmove:', e.target)
    //     var div = document.getElementById(this.state.moving);
    //     div.style.position = 'absolute';
    //     div.style.top = e.clientY + 'px';
    //     div.style.left = e.clientX + 'px';
    // }
    // componentDidMount = () => {
    //     console.log('mounting')
    //     var div = document.getElementById('0')

    //     div.addEventListener('mousedown', this.mousedown, true)
    //     window.addEventListener('mouseup', this.mouseup, true)
    // }
    render() {
        return (
            <div className="container">
            </div>
        );
    }
}

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
    render: function () {
        var eventHub = this.props.glEventHub;
        return (
            <ul className="userlist">
                {this.state.users.map(function (user) {
                    return <User
                        key={user.name}
                        userData={user}
                        glEventHub={eventHub} />
                })}
            </ul>
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
    onDrop: function (e) {
        console.log('heelo')
        console.log(config.content)
        config.content.forEach((v, i) => v.content.push({
            title: 'Users',
            type: 'react-component',
            component: 'user-list'
        }))
        console.log('post configs:', config.content)
    },
    render: function () {
        const style = {
            backgroundColor: "red",
            width: "100%",
            height: "100%"
        }
        return (
            <div onDrop={e => this.onDrop(e)}>
                <li onClick={this.selectUser}>{this.state.name}</li>
                <div styel={style} onDrop={e => this.onDrop(e)}>hello</div>

            </div>
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
var config = {
    content: [{
        type: 'row',
        content: [{
            title: 'Users',
            type: 'react-component',
            component: 'user-list'
        }, {
            title: 'User Detail',
            type: 'react-component',
            component: 'user-detail'
        }]
    }]
};

var myLayout = new GoldenLayout(config);
myLayout.registerComponent('user-list', UserList);
myLayout.registerComponent('user-detail', UserDetail);
myLayout.init();
