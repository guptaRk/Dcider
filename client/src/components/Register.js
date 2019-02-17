import React from 'react';
import { Form, Row, Button } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';

import { register, authError } from '../actions/auth';
import { connect } from 'react-redux';

class Register extends React.Component {

  constructor(props) {
    super(props);
    this.onLogin = this.onLogin.bind(this);
  }

  onLogin(e) {
    e.preventDefault();

    const email = this.refs.email.value;
    const password = this.refs.password.value;
    const name = this.refs.name.value;
    const password2 = this.refs.password2.value;

    if (password !== password2) {
      this.props.authError({ "password2": "password doesn't match" });
      return;
    }
    this.props.register(name, email, password);
  }

  render() {
    const { error, isAuthenticated } = this.props.auth;

    if (isAuthenticated) return <Redirect to="/me" />

    return (
      <div>
        <Form noValidate>

          <Form.Group as={Row}>
            <Form.Label className="col-sm-3">
              Name
            </Form.Label>

            <div className="col-sm-9">
              <Form.Control
                type="text"
                ref="name"
                placeholder="your name"
                isInvalid={error.name ? true : false} />
              <Form.Control.Feedback type="invalid">
                {error.name}
              </Form.Control.Feedback>
            </div>

          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="col-sm-3">
              Email
            </Form.Label>

            <div className="col-sm-9">
              <Form.Control
                type="text"
                ref="email"
                placeholder="email@example.com"
                isInvalid={error.email ? true : false} />
              <Form.Control.Feedback type="invalid">
                {error.email}
              </Form.Control.Feedback>
            </div>

          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="col-sm-3">
              Password
            </Form.Label>

            <div className="col-sm-9">
              <Form.Control
                type="password"
                ref="password"
                placeholder="password here"
                isInvalid={error.password ? true : false} />
              <Form.Control.Feedback type="invalid">
                {error.password}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group as={Row}>
            <Form.Label className="col-sm-3">
              Retype Password
            </Form.Label>

            <div className="col-sm-9">
              <Form.Control
                type="password"
                ref="password2"
                placeholder="retype same passowrd"
                isInvalid={error.password2 ? true : false} />
              <Form.Control.Feedback type="invalid">
                {error.password2}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <div className="d-flex flex-row justify-content-center">
            <Button
              onClick={this.onLogin}
              className="m-2"
              type="submit"
              variant="outline-success">
              Register
          </Button>
            <Link
              to="/login"
              className="m-2">
              <Button variant="outline-info">Already Registered?</Button>
            </Link>
          </div>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth
  }
}

export default connect(mapStateToProps, { register, authError })(Register);