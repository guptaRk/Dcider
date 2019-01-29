import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom';
import { Button, Popover, OverlayTrigger } from 'react-bootstrap';

import { connect } from 'react-redux';
import toggle_menu from '../actions/toggle_menu';

class Scrollspy extends React.Component {

    state = {
        room_disp: false,
        list_disp: false,
    };

    /*
    componentDidMount() {
        window.addEventListener('resize', this.toggle_menu_state.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.toggle_menu_state.bind(this));
    }
    */

    toggle_menu_state() {
        this.setState((prvState) => {
            return { menu_disp: !prvState.menu_disp };
        });
    }

    menu_toggle() {
        console.log(this.refs.hamburger_menu);
        if (this.props.menu_disp === true) {

            this.refs.sideNav.classList.add('sideNav--hide');
            this.refs.sideNav.classList.remove('sideNav--show');

            this.refs.hamburger_menu.classList.add('img-hamburger--show-shadow');
            this.refs.hamburger_menu.classList.remove('img-hamburger--hide-shadow');
        }
        else {

            this.refs.sideNav.classList.add('sideNav--show');
            this.refs.sideNav.classList.remove('sideNav--hide');

            this.refs.hamburger_menu.classList.add('img-hamburger--hide-shadow');
            this.refs.hamburger_menu.classList.remove('img-hamburger--show-shadow');
        }
        console.log(this.props.toggle_menu);
        this.props.toggle_menu();
    }

    room_toggle = () => {
        this.setState((prvState) => {
            return { room_disp: !prvState.room_disp }
        });
    }
    list_toggle = () => {
        this.setState((prvState) => {
            return { list_disp: !prvState.list_disp }
        });
    }

    render() {
        console.log(this);

        const room_items = (this.state.room_disp === true) ? (
            <div className={`sideNav-nested`}>
                <Link to="/rooms/active" className="nested-item shadow">Active Rooms</Link>
                <Link to="/rooms/own" className="nested-item">My Rooms</Link>
                <Link to="/rooms/past" className="nested-item">Past Rooms</Link>
            </div>
        ) : null;

        const list_items = (this.state.list_disp === true) ? (
            <div className={`sideNav-nested`}>
                <Link to="/lists/own" className="nested-item">My Lists</Link>
                <Link to="/lists/imported" className="nested-item">Imported</Link>
            </div>
        ) : null;

        const popover_room = (
            <Popover id="popover-basic">
                <ul className="popover-menu">
                    <li className="popover-menu-item">
                        Active Rooms
                    </li>
                    <li className="popover-menu-item">
                        My Rooms
                    </li>
                    <li className="popover-menu-item">
                        Past Rooms
                    </li>
                </ul>
            </Popover>
        );

        return (
            <div>
                <img
                    src={require("../images/hamburger.png")}
                    alt="hamburger-menu"
                    width="40px"
                    height="40px"
                    className="img-hamburger"
                    style={{ position: "fixed", top: 10, left: 15, "z-index": 10000 }}
                    ref="hamburger_menu"
                    onClick={this.menu_toggle.bind(this)}
                />


                <div
                    className="sideNav bg-light"
                    ref="sideNav">

                    <ul className="menu">
                        <OverlayTrigger trigger="click" placement="right" overlay={popover_room}>
                            <li className="menu-item">
                                Room
                            </li>
                        </OverlayTrigger>
                        <li className="menu-item">
                            X-List
                        </li>
                    </ul>

                    <Button
                        className="sideNav-item w-100"
                        onClick={this.room_toggle.bind(this)}>
                        Room
                    </Button>
                    {room_items}

                    <Button
                        className="sideNav-item border-primary w-100"
                        variant="outline-primary"
                        onClick={this.list_toggle.bind(this)}>
                        X-List
                    </Button>
                    {list_items}


                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        menu_disp: state.toggle_menu
    };
};

export default connect(mapStateToProps, { toggle_menu })(Scrollspy);