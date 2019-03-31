import React from 'react';
import { Card, Button, Form, Row } from 'react-bootstrap';
import { connect } from 'react-redux';

import VerticallyCentredModal from './common/VerticallyCentredModal';
import server from '../Axios';

class Profile extends React.Component {
  isUnmount = false;

  state = {
    changePasswordClicked: false,
    passwordError: null
  };

  componentWillUnmount() {
    this.isUnmount = true;
  }

  onPasswordChange = e => {
    e.preventDefault();

    const oldPass = this.refs.oldPass.value;
    const newPass = this.refs.newPass.value;
    server.post('/users/password-change', { oldPass, newPass })
      .then(result => {
        if (this.isUnmount) return;
        this.refs.textSuccess.innerHTML = result.data.result;

        window.setTimeout(() => this.setState({
          changePasswordClicked: false,
          passwordError: null
        }), 1000);
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response) {
          if (err.response.status === 400 && err.response.data.token) {
            // Token expires or it is deleted by the user
            this.props.logout();
            return;
          }
          if (err.response.status === 400 && err.response.data.password) {
            this.setState({ passwordError: err.response.data.password });
            return;
          }
          // Internal server error or other errors that are not created
          // due to sending the request from the client side
          console.log(err);
        }
      });
  }

  render() {
    return (
      <div className="m-auto">
        <Card>
          <Card.Header className="text-center">
            <b>Profile</b>
          </Card.Header>
          <Card.Body className="d-flex flex-column">
            <Card.Title>{this.props.auth.name}</Card.Title>
            <Card.Text className="text-muted">{this.props.auth.uid}</Card.Text>
            <Button
              className="ml-auto mr-auto"
              variant="outline-info"
              onClick={() => this.setState({ changePasswordClicked: true })}>
              Change Password
            </Button>

            <VerticallyCentredModal
              heading="Change your password"
              show={this.state.changePasswordClicked}
              onHide={() => this.setState({ changePasswordClicked: false, passwordError: null })}>

              <Form className="d-flex flex-column">
                <Form.Group as={Row}>
                  <Form.Label className="col-sm-3">
                    Old Password
                  </Form.Label>

                  <div className="col-sm-9">
                    <Form.Control
                      type="password"
                      ref="oldPass"
                      placeholder="Old password"
                      isInvalid={(this.state.passwordError) ? true : false} />
                    <Form.Control.Feedback type="invalid">
                      {this.state.passwordError}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>

                <Form.Group as={Row}>
                  <Form.Label className="col-sm-3">
                    New Password
                  </Form.Label>

                  <div className="col-sm-9">
                    <Form.Control
                      type="password"
                      ref="newPass"
                      placeholder="New password"
                      isInvalid={(this.state.passwordError) ? true : false} />
                    <Form.Control.Feedback type="invalid">
                      {this.state.passwordError}
                    </Form.Control.Feedback>
                  </div>

                </Form.Group>

                <small className="text-success" ref="textSuccess" />
                <Button
                  type="submit"
                  variant="outline-success"
                  className="ml-auto mr-auto"
                  onClick={this.onPasswordChange}>
                  Change
                </Button>
              </Form>

            </VerticallyCentredModal>
          </Card.Body>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth
  };
};

export default connect(mapStateToProps)(Profile);