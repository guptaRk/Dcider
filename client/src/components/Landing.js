import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../actions/auth';

class Landing extends React.Component {
  render() {
    return (
      <div className="m-auto">
        <Card>
          <Card.Header>
            Dcider
          </Card.Header>
          <Card.Body className="d-flex flex-column">
            <p>
              some text that is quite long to sepatate the two buttons
            </p>
            {this.props.auth.isAuthenticated === true
              ? <Button
                variant="outline-danger"
                onClick={this.props.logout()}
              >
                Logout
                </Button>
              :
              <div className="d-flex flex-row">

                <Link to="/login">
                  <Button variant="outline-success">
                    Login
                  </Button>
                </Link>

                <Link to="/register" className="ml-auto">
                  <Button variant="outline-primary">
                    Register
                  </Button>
                </Link>

              </div>

            }
          </Card.Body>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth
  }
};

export default withRouter(connect(mapStateToProps, { logout })(Landing));