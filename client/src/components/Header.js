import React, { Component } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import '../App.css';

import { connect } from 'react-redux';

class Header extends Component {

    menu_click(e) {
        console.log(e);
    }

    render() {
        return (
            <Navbar bg="light" fixed="top" style={{ height: 60 }}>
                <Navbar.Brand className="ml-5">Decider</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        <Nav.Item>
                            <Nav.Link href="/login">Login</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link href="/signup">Sign Up</Nav.Link>
                        </Nav.Item>
                    </Nav>
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

export default (Header);