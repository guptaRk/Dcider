import React from 'react';
import server from '../../Axios';
import {
  InputGroup,
  Form,
  Button,
  Table,
  ListGroup,
  DropdownButton,
  Dropdown,
  FormControl
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { logout } from '../../actions/auth';
import VerticallyCentredModal from '../common/VerticallyCentredModal';

class RoomDisplay extends React.Component {
  isUnmount = false;

  state = {
    // the things returned from the server directly
    owner: '',
    members: [],
    name: '',
    description: '',
    pollItems: {
      keys: [],
      values: []
    },
    status: 'closed',
    usersPolled: [],
    result: [],

    // for editing the name of the current room
    nameChanged: false,
    isNameValid: true,

    // for the modals
    usersPolledShow: false,
    membersListShow: false,

    //adding a member
    userError: null,
    addUserClicked: false,

    //adding a poll
    contributeClicked: false
  };

  componentDidMount() {
    const { type, name } = this.props.match.params;
    server
      .get(`/room/${type}/${name}`)
      .then(result => {
        if (this.isUnmount) return;
        this.setState({ ...result.data });
        this.mapTheResult();
      })
      .catch(err => {
        if (err.response && err.response.status === 400) {
          if (this.isUnmount) return;
          // either token expires or user modifies it
          this.props.logout();
          return;
        }
      });
  }

  componentWillUnmount() {
    this.isUnmount = true;
  }

  // for getting an appropraite mapping from the result array
  mapTheResult = () => {
    const values = this.state.pollItems.values.slice();
    // considering that the keys are intact and
    // the result array gives the position in the value array
    // that match with the given index's key

    for (let i = 0; i < this.state.pollItems.values.length; i++)
      this.state.pollItems.values[i] = values[this.state.result[i]];
  };

  onNameChange = evt => {
    this.setState({
      name: evt.target.value,
      nameChanged: true
    });
  };

  nameChange = () => {
    const currentName = this.state.name;
    const nameRegex = /^([a-zA-Z])([a-zA-Z_0-9]){2,249}$/;
    this.setState({ isNameValid: nameRegex.test(currentName) });
    if (this.state.isNameValid) {
      // send the updated name to the server
    }
  };

  toggleStatus = () => {
    server
      .post(`/room/my/${this.state.name}/toggle`)
      .then(result => {
        if (this.isUnmount) return;
        this.setState(prvState => {
          return {
            status: prvState.status === 'active' ? 'closed' : 'active'
          };
        });
      })
      .catch(err => {
        if (err.response && err.response.status === 400) {
          if (this.isUnmount) return;
          // either token expires or user modifies it
          this.props.logout();
          return;
        }
      });
  };

  deleteMember = evt => {
    const element = evt.target;
    if (!element.classList.contains('deleteMember')) return;
    server
      .post(`/room/remove/member/${this.state.name}`, { email: element.id })
      .then(result => {
        if (this.isUnmount) return;
        this.setState(prvState => {
          return {
            members: prvState.members.filter(x => x !== element.id)
          };
        });
      })
      .catch(err => {
        if (err.response && err.response.status === 400) {
          if (this.isUnmount) return;
          // either token expires or user modifies it
          if (err.response.data.token) {
            this.props.logout();
            return;
          }
        }
      });
  };

  addMember = () => {
    const email = this.refs.addUserField.value;
    server
      .post(`/room/add/member/${this.state.name}`, { email })
      .then(result => {
        if (this.isUnmount) return;
        this.setState(prvState => {
          prvState.members.push(email);
          return { members: prvState.members };
        });
      })
      .catch(err => {
        if (err.response && err.response.status === 400) {
          if (this.isUnmount) return;
          // either token expires or user modifies it
          if (err.response.data.token) {
            this.props.logout();
            return;
          }
          if (err.response.data.user) {
            this.setState({ userError: err.response.data.user });
            return;
          }
        }
      });
  };

  onPollSubmit = () => {
    const n = this.state.pollItems.keys.length;

    // make a mapping which is helpful for assigning indexes to the keys and values
    const keyMapping = {};
    const valueMapping = {};
    for (let i = 0; i < n; i += 1) {
      keyMapping[this.state.pollItems.keys[i]] = i;
      valueMapping[this.state.pollItems.values[i]] = i;
    }

    const key = [];
    const value = [];
    for (let i = 0; i < n; i += 1) {
      key.push(keyMapping[this.refs[`keyChoice${i}`].value]);
      value.push(valueMapping[this.refs[`valueChoice${i}`].value]);
    }

    // Check whether the given choice is a valid one or not?
    let copy = key.slice();
    copy.sort();
    for (let i = 0; i < n; i += 1)
      if (copy[i] !== i) {
        // TODO: Error
        console.log('key error!');
        break;
      }

    copy = value.slice();
    copy.sort();
    for (let i = 0; i < n; i += 1)
      if (copy[i] !== i) {
        // TODO: Error
        console.log('value error!');
        break;
      }

    const finalMapping = new Array(n);
    for (let i = 0; i < n; i += 1) finalMapping[key[i]] = value[i];

    server
      .post(`/room/${this.state.name}/poll`, {
        owner: this.state.owner,
        order: finalMapping
      })
      .then(res => {
        if (this.isUnmount) return;
        console.log(res);
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response && err.response.status === 400) {
          // either token expires or user modifies it
          if (err.response.data.token) {
            this.props.logout();
          }
        }
      });
  };

  render() {
    const { keys, values } = this.state.pollItems;
    const keyValuePairs = [];
    for (let i = 0; i < keys.length; i += 1)
      keyValuePairs.push({ key: keys[i], value: values[i] });

    return (
      <div className="d-flex flex-column h-100">
        <InputGroup className="mt-3">
          <Form.Control
            placeholder="Room name"
            aria-label="current room name"
            value={this.state.name}
            onChange={this.onNameChange}
            isInvalid={!this.state.isNameValid}
          />

          <InputGroup.Append>
            <Button
              disabled={!this.state.nameChanged}
              onClick={this.nameChange}
            >
              Edit
            </Button>
          </InputGroup.Append>
          <Form.Control.Feedback type="invalid">
            Name must starts with a letter and should contains only digits and
            letters
          </Form.Control.Feedback>
        </InputGroup>

        <p className="mt-3 text-info">{this.state.description}</p>

        <div className="d-flex flex-row">
          <Button
            variant={
              this.state.status === 'active'
                ? 'outline-danger'
                : 'outline-success'
            }
            className="ml-auto mb-2"
            onClick={this.toggleStatus}
            disabled={this.state.owner !== this.props.auth.uid}
          >
            {this.state.status === 'active' ? 'close it' : 'open it'}
          </Button>
        </div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Keys</th>
              <th>Values</th>
            </tr>
          </thead>
          <tbody>
            {keyValuePairs.map((cur, ind) => {
              return (
                <tr key={ind}>
                  <td>{cur.key}</td>
                  <td>{cur.value}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <div className="d-flex flex-row">
          <Button
            variant="outline-dark"
            onClick={() => this.setState({ usersPolledShow: true })}
          >
            Users Polled
          </Button>

          <Button
            className="ml-auto"
            variant="outline-dark"
            onClick={() => this.setState({ membersListShow: true })}
          >
            Members
          </Button>

          <VerticallyCentredModal
            show={this.state.usersPolledShow}
            onHide={() => this.setState({ usersPolledShow: false })}
            heading="Polled users"
          >
            <ListGroup>
              {this.state.usersPolled.map((cur, ind) => (
                <ListGroup.Item key={ind} variant="secondary">
                  <div className="d-flex flex-row flex-wrap text-overflow-control">
                    <b className="text-overflow-control">{cur.givenBy}</b>
                    <i className="ml-auto">
                      {this.getTimeDifference(new Date(cur.lastUpdated))}
                    </i>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </VerticallyCentredModal>

          <VerticallyCentredModal
            show={this.state.membersListShow}
            onHide={() =>
              this.setState({
                membersListShow: false,
                addUserClicked: false,
                userError: null
              })
            }
            heading="Room members"
          >
            {/* Instead of attaching a number of onClick we add only one and here */}
            <ListGroup onClick={this.deleteMember}>
              {this.state.members.map((cur, ind) => {
                return (
                  <ListGroup.Item
                    key={`ListGroupItemShowingMembers${ind}`}
                    className="d-flex flex-row"
                    variant="info"
                  >
                    <i className="text-overflow-control">{cur}</i>
                    {this.state.owner === this.props.auth.uid && (
                      <button
                        className="ml-auto deleteMember"
                        id={`${cur}`}
                        type="button"
                        style={{
                          cursor: 'pointer',
                          border: 'none',
                          color: 'inherit',
                          background: 'none'
                        }}
                      >
                        x
                      </button>
                    )}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>

            {this.state.owner === this.props.auth.uid && (
              <div className="d-flex flex-row">
                {this.state.addUserClicked === false ? (
                  <Button
                    variant="outline-success"
                    className="ml-auto mt-3"
                    style={{ borderRadius: '50px' }}
                    onClick={() => this.setState({ addUserClicked: true })}
                  >
                    +
                  </Button>
                ) : (
                    <InputGroup className="mt-3">
                      <Form.Control
                        placeholder="user's email"
                        ref="addUserField"
                        type="text"
                        isInvalid={this.state.userError ? true : false}
                      />
                      <InputGroup.Append>
                        <Button
                          variant="outline-success"
                          onClick={this.addMember}
                        >
                          Add
                      </Button>
                      </InputGroup.Append>
                      <InputGroup.Append>
                        <Button
                          variant="outline-warning"
                          onClick={() => this.setState({ addUserClicked: false })}
                        >
                          Cancel
                      </Button>
                      </InputGroup.Append>

                      <Form.Control.Feedback type="invalid">
                        {this.state.userError}
                      </Form.Control.Feedback>
                    </InputGroup>
                  )}
              </div>
            )}
          </VerticallyCentredModal>
        </div>

        {/* For adding a poll in the current room */}
        <div className="mt-auto ml-auto mr-auto">
          <Button
            variant="outline-primary"
            onClick={() => this.setState({ contributeClicked: true })}
          >
            Want to contribute?
          </Button>

          <VerticallyCentredModal
            heading={`Polling in the room '${this.state.name}'`}
            onHide={() => this.setState({ contributeClicked: false })}
            show={this.state.contributeClicked}
          >
            <div className="d-flex flex-column">
              <Table bordered striped>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Values</th>
                  </tr>
                </thead>

                <tbody>
                  {/* create an array of values [0, 1, 2 .....] */}
                  {new Array(this.state.pollItems.keys.length)
                    .fill(0)
                    .map((x, cur) => cur)
                    .map(x => (
                      <tr key={`row${x}`}>
                        <td>
                          <InputGroup>
                            <FormControl
                              placeholder="key choice"
                              aria-label="key-choice"
                              ref={`keyChoice${x}`}
                            />
                            <DropdownButton
                              as={InputGroup.Append}
                              variant="outline-secondary"
                              title="select"
                            >
                              {this.state.pollItems.keys.map(cur => (
                                <Dropdown.Item
                                  key={cur}
                                  eventKey={cur}
                                  onSelect={eventKey => {
                                    this.refs[`keyChoice${x}`].value = eventKey;
                                  }}
                                >
                                  {cur}
                                </Dropdown.Item>
                              ))}
                            </DropdownButton>
                          </InputGroup>
                        </td>
                        <td>
                          <InputGroup>
                            <FormControl
                              placeholder="value choice"
                              aria-label="value-choice"
                              ref={`valueChoice${x}`}
                            />
                            <DropdownButton
                              alignRight
                              as={InputGroup.Append}
                              variant="outline-secondary"
                              title="select"
                            >
                              {this.state.pollItems.values.map(cur => (
                                <Dropdown.Item
                                  key={cur}
                                  eventKey={cur}
                                  onSelect={eventKey => {
                                    this.refs[
                                      `valueChoice${x}`
                                    ].value = eventKey;
                                  }}
                                >
                                  {cur}
                                </Dropdown.Item>
                              ))}
                            </DropdownButton>
                          </InputGroup>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
              <Button
                variant="outline-success"
                className="ml-auto mr-auto"
                onClick={this.onPollSubmit}
              >
                Submit
              </Button>
            </div>
          </VerticallyCentredModal>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth
  };
};

export default connect(
  mapStateToProps,
  { logout }
)(RoomDisplay);