import React from 'react';
import '../App.css';
import { Link, withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import toggle_menu from '../actions/toggle_menu';
import { logout } from '../actions/auth';

class Scrollspy extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  logout(e) {
    e.preventDefault();
    this.props.logout();
    this.props.history.push('/login');
  }

  /*
    Dispatches the action to toggle the menu state
  */
  menu_toggle = () => {
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
            style={{ paddingTop: "60px" }}>

            <Link className="menu-item" to="/room">
              <div className="menu-item-icon">
                <img
                  src={require('../images/r.png')}
                  width="50px"
                  alt="notes"
                  height="50px" />
              </div>
              {(open ? (<div className="menu-item-text">
                Rooms
              </div>) : null)}
            </Link>

            <Link className="menu-item" to="/xlist">
              <div className="menu-item-icon">
                <img
                  src={require('../images/x.png')}
                  width="50px"
                  alt="notes"
                  height="50px" />
              </div>
              {(open ? (<div className="menu-item-text">
                X-List
              </div>) : null)}
            </Link>

            <Link className="menu-item" to="/poll-items">
              <div className="menu-item-icon">
                <img
                  src={require('../images/p.png')}
                  width="50px"
                  alt="notes"
                  height="50px" />
              </div>
              {(open ? (<div className="menu-item-text">
                Poll-Items
              </div>) : null)}
            </Link>

            <div
              className="d-flex flex-column"
              style={{ "marginTop": "auto" }}>
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
                <div className="menu-item-icon" onClick={this.logout}>
                  <img
                    src={require('../images/logout.png')}
                    width="50px"
                    alt="notes"
                    height="50px" />
                </div>
                {(open ? (<div className="menu-item-text" onClick={this.logout}>
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

// use of withRouter is due to the fact that we need a history props
export default withRouter(connect(mapStateToProps, { toggle_menu, logout })(Scrollspy));