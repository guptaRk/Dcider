import React from 'react';
import { Form, Row, Button } from 'react-bootstrap';
import { Link, Redirect } from 'react-router-dom';

import { login } from '../actions/auth';
import { connect } from 'react-redux';

class Login extends React.Component {

  constructor(props) {
    super(props);

    this.onLogin = this.onLogin.bind(this);
  }

  onLogin(e) {
    e.preventDefault();

    const email = this.refs.email.value;
    const password = this.refs.password.value;
    this.props.login(email, password);
  }

  render() {
    const { error, isAuthenticated } = this.props.auth;
    console.log(this.props);
    // to redirect to the same page the user is coming
    const { from } = this.props.location.state || { from: '/me' };

    if (isAuthenticated) {
      return <Redirect to={from} />
    }
    return (
      <div>
        <Form noValidate>

          <Form.Group as={Row}>
            <Form.Label className="col-sm-3">
              Email
            </Form.Label>


            <div className="col-sm-9">
              <Form.Control
                type="text"
                ref="email"
                placeholder="email@example.com"
                isInvalid={(error.email) ? true : false} />
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

          <div className="d-flex flex-row justify-content-center">
            <Button
              onClick={this.onLogin}
              className="m-2"
              type="submit"
              variant="outline-success">
              Login
          </Button>
            <Link
              to="/register"
              className="m-2">
              <Button variant="outline-info">Not Registered?</Button>
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
};

export default connect(mapStateToProps, { login })(Login);