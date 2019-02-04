import React from 'react';
import '../App.css';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import toggle_menu from '../actions/toggle_menu';

class Scrollspy extends React.Component {

  /*
    Dispatches the action to toggle the menu state
  */
  menu_toggle = () => {
    console.log(this.props.toggle_menu + " : inside the scrollspy");
    this.props.toggle_menu();
  }

  render() {
    const open = this.props.menu_disp;

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

          {/* marginTop is set to the heght of the header
          so that the items don't get hide beneath header */}
          <ul
            className="menu d-flex flex-column h-100"
            style={{ marginTop: "60px" }}>

            <Link className="menu-item" to="/notes">
              <div className="menu-item-icon">
                <img
                  src={require('../images/notes.png')}
                  width="50px"
                  alt="notes"
                  height="50px" />
              </div>
              {(open ? (<div className="menu-item-text">
                Notes
              </div>) : null)}
            </Link>

            <Link className="menu-item" to="/xlist">
              <div className="menu-item-icon">
                <img
                  src={require('../images/xlist.png')}
                  width="50px"
                  alt="notes"
                  height="50px" />
              </div>
              {(open ? (<div className="menu-item-text">
                X-List
              </div>) : null)}
            </Link>

            <Link className="menu-item" to="/template">
              <div className="menu-item-icon">
                <img
                  src={require('../images/template.png')}
                  width="50px"
                  alt="notes"
                  height="50px" />
              </div>
              {(open ? (<div className="menu-item-text">
                Template
              </div>) : null)}
            </Link>

            <Link className="menu-item" to="/changeIt">
              <div className="menu-item-icon">
                <img
                  src={require('../images/template.png')}
                  width="50px"
                  alt="notes"
                  height="50px" />
              </div>
              {(open ? (<div className="menu-item-text">
                ChangeItAndIcon
              </div>) : null)}
            </Link>

            <div
              className="d-flex flex-column"
              style={{ "margin-top": "auto" }}>
              <hr width="50px" />

              <Link className="menu-item" to="/help">
                <div className="menu-item-icon">
                  <img
                    src={require('../images/help.png')}
                    width="50px"
                    alt="notes"
                    height="50px" />
                </div>
                {(open ? (<div className="menu-item-text">
                  Help
              </div>) : null)}
              </Link>

              <Link className="menu-item" to="/">
                <div className="menu-item-icon">
                  <img
                    src={require('../images/logout.png')}
                    width="50px"
                    alt="notes"
                    height="50px" />
                </div>
                {(open ? (<div className="menu-item-text">
                  Log Out
                </div>) : null)}
              </Link>
            </div>

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