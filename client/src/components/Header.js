import React, { Component } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import '../App.css';
import { withRouter, Link } from 'react-router-dom';

import { connect } from 'react-redux';
import { logout } from '../actions/auth';

class Header extends Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
  }

  state = {
    profileClicked: false
  };

  logout(e) {
    e.preventDefault();
    this.props.logout();
    this.props.history.push('/login');
  }

  render() {
    return (
      <Navbar className="bg-light" fixed="top" expand="sm">
        <Navbar.Brand className="ml-5">
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "inherit"
            }}>
            Decider
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          {(this.props.auth.isAuthenticated === false)
            ? (
              <Nav className="ml-auto">
                <Nav.Item bsPrefix="ml-auto">
                  <Nav.Link href="/login">Login</Nav.Link>
                </Nav.Item>
                <Nav.Item bsPrefix="ml-auto">
                  <Nav.Link href="/register">Sign Up</Nav.Link>
                </Nav.Item>
              </Nav>
            )

            : (
              <Nav className="ml-auto div-hover--pointer">
                <Nav.Item
                  onClick={() => this.props.history.push('/me')}
                  className="p-2 ml-auto"
                >
                  Profile
                </Nav.Item>
                <Nav.Item
                  bsPrefix="p-2 ml-auto"
                  onClick={this.logout}>
                  Logout
                  </Nav.Item>
              </Nav>
            )
          }
          {/* 
          align this element to the end of the current panel

          m-auto : get the left over space and distribute it equally (both horizontally and vertically)
          ml-auto: get the left-over space and align the element in the rightmost corner
          mr-auto: get the left-over space and align the element in the leftmost corner

          <Nav className="align-self-end m-auto" >Hello</Nav>
        */}
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth
  }
}

// withRouter gives us the history object in props
export default withRouter(connect(mapStateToProps, { logout })(Header));