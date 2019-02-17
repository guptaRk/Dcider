import React from 'react';
import server from '../Axios';
import { logout } from '../actions/auth';
import { connect } from 'react-redux';
import { Form, InputGroup, ListGroup, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

class XlistDisplay extends React.Component {
  state = {
    invalidTypeOrName: false,
    invalidCaseError: null,

    xlist: {},

    addButtonClicked: false
  };

  componentDidMount() {
    //console.log(this.props.match);
    const { name, type } = this.props.match.params;
    if (type !== 'me' && type !== 'others') {
      this.setState({ invalidTypeOrName: false });
      return;
    }

    server.get(`/xlist/${type}/${name}`)
      .then(response => this.setState({ xlist: response.data }))
      .catch(err => {
        console.log('xlist: ', err.response);
        if (err.response.status === 400) {
          if (err.response.data.token) {
            // Token expires or is changed by the user
            // so just logout and rest is handled by PrivateRoute
            this.props.logout();
            return;
          }
          this.setState({
            invalidTypeOrName: true,
            invalidCaseError: err.response.data
          });
          return;
        }
        // Internal server error
      });
  }

  addButtonClicked = (e) => {
    e.preventDefault();
    this.setState({ addButtonClicked: true });
  }

  removeMember = (e) => {
    const email = e.target.parentElement.children[0].textContent;
    const listElement = e.target.parentElement.parentElement;

    server.post(`/xlist/me/remove/${this.props.match.params.name}`, { email: email })
      .then(response => {
        this.refs.statusMessages.innerHTML =
          `<p style="color: green">successfully removed '${email}'!</p>`;
        setTimeout(() => this.refs.statusMessages.innerHTML = "", 2000);
        // remove the email from the list locally also (no refresh require here)
        console.log(listElement);
        listElement.remove();
      })
      .catch(err => {
        console.log(err);
        if (err.response && err.response.status === 400) {
          if (err.response.data.token) {
            // token expires or is changed by the user
            this.props.logout();
            return;
          }
          // attempt to delete the user
          this.refs.statusMessages.innerHTML =
            `<p style="color: red">${err.response.data.email}</p>`;
          setTimeout(() => this.refs.statusMessages.innerHTML = "", 20000);
          // other 400 responses are not for the client sending request from here
        }
        if (err.response && err.response.status === 500) {
          alert('Internal server error! Please try again.');
          return;
        }
      });
  }

  render() {
    if (this.state.invalidTypeOrName) {
      // send the error object which can be accessed using location and shall be displayed in error page
      return <Redirect to={{
        pathname: '/error',
        state: { errorObject: this.state.invalidCaseError }
      }} />
    }

    console.log(this.state.xlist);
    return (
      <div className="d-flex flex-column w-100 h-100">
        <InputGroup className="mb-3">
          <Form.Control
            disabled
            className="col-sm-11"
            type="text"
            ref="name"
            value={this.state.xlist.name}
            placeholder="Xlist name" />

          <InputGroup.Append>
            <img
              src={require('../images/edit.png')}
              alt="edit"
              height="40px"
              className="border"
              style={{ cursor: "pointer" }} />
          </InputGroup.Append>
        </InputGroup>

        <ListGroup>
          <ListGroup.Item variant="info">
            <b>Members</b>
          </ListGroup.Item>
          {this.state.xlist.members &&
            this.state.xlist.members.map((x, ind) =>
              (<ListGroup.Item key={ind} variant="light">
                <div className="d-flex flex-row">
                  <div>{x}</div>
                  {/* Delete button will show if xlist is owned by the user itself */}
                  {this.props.match.params.type === 'me' &&
                    <b
                      style={{ marginLeft: "auto", cursor: "pointer" }}
                      onClick={this.removeMember}>
                      x
                  </b>}
                </div>
              </ListGroup.Item>))}
        </ListGroup>
        <small ref="statusMessages"></small>

        <div className="d-flex flex-row" style={{ marginTop: "auto" }}>
          {this.state.addButtonClicked === false ?
            <Button
              style={{ width: "40px", borderRadius: "20px", marginLeft: "auto" }}
              onClick={this.addButtonClicked}>
              +
            </Button>
            :
            <div>Add form</div>}
        </div>
      </div>
    );
  }
}

export default connect(null, { logout })(XlistDisplay);