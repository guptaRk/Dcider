import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import toggle_menu from '../actions/toggle_menu';

class Scrollspy extends React.Component {

    menu_toggle = () => {
        console.log(this.props.toggle_menu + " : inside the scrollspy");
        this.props.toggle_menu();
    }

    render() {
        return (
            <div>
                <img
                    src={require("../images/hamburger.png")}
                    alt="hamburger-menu"
                    width="40px"
                    height="40px"
                    className="img-hamburger"
                    style={{ position: "fixed", top: 10, left: 15, zIndex: 10000 }}
                    ref="hamburger_menu"
                    onClick={this.menu_toggle}
                />


                <div
                    className={"sideNav bg-light " +
                        ((this.props.menu_disp === true) ?
                            "sideNav--show" : "sideNav--hide")}
                    ref="sideNav">

                    <ul className="menu">

                        <li className="menu-item">
                            Room
                        </li>
                        <li className="menu-item">
                            X-List
                        </li>
                    </ul>

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