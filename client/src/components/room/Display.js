import React from "react";
import {
  InputGroup,
  Form,
  Button,
  Table,
  ListGroup,
  DropdownButton,
  Dropdown,
  FormControl
} from "react-bootstrap";
import { connect } from "react-redux";

import server from "../../Axios";
import { logout } from "../../actions/auth";
import VerticallyCentredModal from "../common/VerticallyCentredModal";
import getTimeDifference from "../../utils/getTimeDifference";
import "./index.css";

class RoomDisplay extends React.Component {
  isUnmount = false;

  state = {
    // the things returned from the server directly
    owner: "",
    members: [],
    name: "",
    description: "",
    pollItem: {
      keys: [],
      values: []
    },
    status: "closed",
    usersPolled: [],
    result: [],
    lastUpdated: Date.now(),

    // for editing the name of the current room
    nameChanged: false,
    isNameValid: true,

    // for the modals
    usersPolledShow: false,
    membersListShow: false,

    // adding a member
    userError: null,
    addUserClicked: false,

    // adding a poll
    contributeClicked: false,

    // updating the list of poll-item
    updatePollItemShow: false,
    addOrRemovePollItemClicked: null,
    addOrRemovePollItemError: null,

    // for the result
    resultDisplayClicked: false,
    finalkeyValueResult: []
  };

  componentDidMount() {
    this.refreshRoom();
  }

  componentWillUnmount() {
    this.isUnmount = true;
  }

  refreshRoom = () => {
    const { type, name } = this.props.match.params;
    server
      .get(`/room/${type}/${name}`)
      .then(result => {
        if (this.isUnmount) return;
        this.setState({ ...result.data });
        this.mapTheResult();
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (
          err.response &&
          err.response.status === 400 &&
          err.response.data.token
        ) {
          // either token expires or user modifies it
          this.props.logout();
          return;
        }
        // other errors
        // console.log(err);
      });
  };

  // for getting an appropraite mapping from the result array
  mapTheResult = () => {
    const values = this.state.pollItem.values.slice();
    // considering that the keys are intact and
    // the result array gives the position in the value array
    // that match with the given index's key

    this.setState(prvState => {
      for (let i = 0; i < prvState.pollItem.values.length; i += 1)
        prvState.pollItem.values[i] = values[prvState.result[i]];
      return prvState;
    });
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
            status: prvState.status === "active" ? "closed" : "active"
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
        // console.log(err);
      });
  };

  deleteMember = evt => {
    const element = evt.target;
    if (!element.classList.contains("deleteMember")) return;
    server
      .post(`/room/remove/member/${this.state.name}`, { email: element.id })
      .then(() => {
        if (this.isUnmount) return;
        this.setState(prvState => {
          return {
            members: prvState.members.filter(x => x !== element.id)
          };
        });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response && err.response.status === 400) {
          // either token expires or user modifies it
          if (err.response.data.token) {
            this.props.logout();
            return;
          }
        }
        // console.log(err);
      });
  };

  usersPolledClicked = () => {
    this.setState({ usersPolledShow: true });
    // TODO: write an end-point to get this data only
    this.refreshRoom();
  };

  membersClicked = () => {
    this.setState({ membersListShow: true });
    // TODO: write an end-point to get this data only
    this.refreshRoom();
  };

  updatePollItemClicked = () => {
    this.setState({ updatePollItemShow: true });
    // TODO: write an end-point to get this data only
    this.refreshRoom();
  };

  onAddOrRemovePollItemClicked = () => {
    const key = this.refs.addOrRemovePollItemKey.value;
    const value = this.refs.addOrRemovePollItemValue.value;

    // sends the request to the server to add or remove the poll-item
    const requestString =
      this.state.addOrRemovePollItemClicked === "Add"
        ? `/room/add/pollItem/${this.state.name}`
        : `/room/remove/pollItem/${this.state.name}`;

    server
      .post(requestString, { key, value })
      .then(result => {
        if (this.isUnmount) return;

        // console.log(result.data.pollItems);
        this.setState({
          pollItem: result.data.pollItem,
          addOrRemovePollItemClicked: null
        });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response && err.response.status === 400) {
          if (err.response.data.token) {
            // Token expires or is invalid
            this.props.logout();
            return;
          }
          // poll-item error
          this.setState({
            addOrRemovePollItemError: err.response.data.pollitem
          });
          return;
        }
        // Internal server error
        // console.log(err);
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
          // other errors
          // console.log(err);
        }
      });
  };

  onPollSubmit = () => {
    const n = this.state.pollItem.keys.length;

    // make a mapping which is helpful for assigning
    // indexes to the keys and values
    const keyMapping = {};
    const valueMapping = {};
    for (let i = 0; i < n; i += 1) {
      keyMapping[this.state.pollItem.keys[i]] = i;
      valueMapping[this.state.pollItem.values[i]] = i;
    }

    // console.log(keyMapping, valueMapping);

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
        // console.log('key error!');
        break;
      }

    copy = value.slice();
    copy.sort();
    for (let i = 0; i < n; i += 1)
      if (copy[i] !== i) {
        // TODO: Error
        // console.log('value error!');
        break;
      }

    const finalMapping = new Array(n);
    for (let i = 0; i < n; i += 1) finalMapping[key[i]] = value[i];

    server
      .post(`/room/${this.state.name}/poll`, {
        owner: this.state.owner,
        order: finalMapping
      })
      .then(result => {
        if (this.isUnmount) return;
        this.refs.addPollError.innerHTML =
          '<p style="color: green">Successfully recorded</p>';
        // close the modal after a slight delay
        window.setTimeout(
          () => this.setState({ contributeClicked: false }),
          1000
        );
        // set the polls-according to current user
        this.setState({
          pollItem: {
            keys: result.data.keys,
            values: result.data.values
          }
        });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response && err.response.status === 400) {
          // either token expires or user modifies it
          if (err.response.data.token) {
            this.props.logout();
            return;
          }
          // ordering is invalid
          if (err.response.data.order) {
            this.refs.addPollError.innerHTML = `${err.response.data.order}`;
            return;
          }
          // other errors are not because of client side part
          // console.log(err.response);
        }
      });
  };

  resultClicked = () => {
    if (this.state.status === "active") return;
    server
      .get(`/room/${this.state.owner}/${this.state.name}/result`)
      .then(result => {
        if (this.isUnmount) return;

        this.setState({ finalkeyValueResult: result.data.result });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response && err.response.status === 400) {
          // either token expires or user modifies it
          if (err.response.data.token) {
            this.props.logout();
            return;
          }
          // other errors are not because of client side part
          // console.log(err.response);
        }
      });

    this.setState({ resultDisplayClicked: true });
  };

  render() {
    // console.log(this.state.owner, this.props.auth.uid);

    const { keys, values } = this.state.pollItem;
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
            disabled={this.props.auth.uid !== this.state.owner}
          />

          <InputGroup.Append>
            {this.props.auth.uid === this.state.owner && (
              <Button
                disabled={!this.state.nameChanged}
                onClick={this.nameChange}
              >
                Edit
              </Button>
            )}
          </InputGroup.Append>
          <Form.Control.Feedback type="invalid">
            Name must starts with a letter and should contains only digits and
            letters
          </Form.Control.Feedback>
        </InputGroup>

        <p className="mt-3 text-info">{this.state.description}</p>

        <div className="d-flex flex-row">
          <Button
            disabled={this.state.status === "active"}
            variant="outline-info"
            className="mb-2"
            onClick={this.resultClicked}
          >
            Results
          </Button>

          <Button
            variant={
              this.state.status === "active"
                ? "outline-danger"
                : "outline-success"
            }
            className="ml-auto mb-2"
            onClick={this.toggleStatus}
            disabled={this.state.owner !== this.props.auth.uid}
          >
            {this.state.status === "active" ? "close it" : "open it"}
          </Button>
        </div>

        <VerticallyCentredModal
          heading={`Final results of poll-room '${this.state.name}'`}
          show={this.state.resultDisplayClicked}
          onHide={() => this.setState({ resultDisplayClicked: false })}
        >
          <Table striped>
            <thead>
              <tr>
                <th>Keys</th>
                <th>Values</th>
              </tr>
            </thead>
            <tbody>
              {this.state.finalkeyValueResult.map(x => (
                <tr key={`FianlResult${x[0]}`}>
                  <td>{x[0]}</td>
                  <td>{x[1]}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </VerticallyCentredModal>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Keys</th>
              <th>Values</th>
            </tr>
          </thead>
          <tbody>
            {keyValuePairs.map(cur => {
              return (
                <tr key={`pollItem_${cur.key}`}>
                  <td>{cur.key}</td>
                  <td>{cur.value}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <div className="d-flex flex-row">
          <Button variant="outline-dark" onClick={this.usersPolledClicked}>
            Users Polled
          </Button>

          <Button
            className="ml-auto"
            variant="outline-dark"
            onClick={this.membersClicked}
          >
            Members
          </Button>

          <VerticallyCentredModal
            show={this.state.usersPolledShow}
            onHide={() => this.setState({ usersPolledShow: false })}
            heading="Polled users"
          >
            <ListGroup>
              {this.state.usersPolled.map(cur => (
                <ListGroup.Item
                  key={`usersPolledShow_${cur.givenBy}`}
                  variant="secondary"
                >
                  <div className="d-flex flex-row flex-wrap text-overflow-control">
                    <b className="text-overflow-control">{cur.givenBy}</b>
                    <i className="ml-auto">
                      {getTimeDifference(new Date(cur.lastUpdated))}
                    </i>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </VerticallyCentredModal>

          <VerticallyCentredModal
            show={this.state.updatePollItemShow}
            onHide={() =>
              this.setState({
                updatePollItemShow: false,
                addOrRemovePollItemClicked: null
              })
            }
            heading="Poll-Items in the current room"
          >
            {/* show the current poll-items */}
            <Table bordered striped>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Values</th>
                </tr>
              </thead>
              <tbody>
                {keyValuePairs.map(x => (
                  <tr key={`UpdatePollItem${x.key}$$${x.value}`}>
                    <td>{x.key}</td>
                    <td>{x.value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {/* Add options to add (or remove) a poll-item */}
            {this.state.addOrRemovePollItemClicked === null && (
              <div className="d-flex flex-row">
                <Button
                  variant="outline-info"
                  onClick={() =>
                    this.setState({ addOrRemovePollItemClicked: "Add" })
                  }
                >
                  Add
                </Button>
                <Button
                  className="ml-auto"
                  variant="outline-danger"
                  onClick={() =>
                    this.setState({ addOrRemovePollItemClicked: "Remove" })
                  }
                >
                  Delete
                </Button>
              </div>
            )}

            {/* show the input fields */}
            {this.state.addOrRemovePollItemClicked && (
              <InputGroup>
                <Form.Control
                  type="text"
                  ref="addOrRemovePollItemKey"
                  placeholder="Key"
                  isInvalid={this.state.addOrRemovePollItemError !== null}
                />
                <Form.Control
                  type="text"
                  ref="addOrRemovePollItemValue"
                  placeholder="Value"
                  isInvalid={this.state.addOrRemovePollItemError !== null}
                />
                <InputGroup.Append>
                  <Button
                    variant="outline-dark"
                    onClick={this.onAddOrRemovePollItemClicked}
                  >
                    {this.state.addOrRemovePollItemClicked}
                  </Button>
                  <Button
                    onClick={() =>
                      this.setState({
                        addOrRemovePollItemClicked: null,
                        addOrRemovePollItemError: null
                      })
                    }
                    variant="outline-dark"
                  >
                    Cancel
                  </Button>
                </InputGroup.Append>
                <Form.Control.Feedback type="invalid">
                  {this.state.addOrRemovePollItemError}
                </Form.Control.Feedback>
              </InputGroup>
            )}
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
            {/* Instead of attaching a number of onClick
             * we add only one and here
             */}
            <ListGroup onClick={this.deleteMember}>
              {this.state.members.map(cur => {
                return (
                  <ListGroup.Item
                    key={`ListGroupItemShowingMembers${cur}`}
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
                          cursor: "pointer",
                          border: "none",
                          color: "inherit",
                          background: "none"
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
                    style={{ borderRadius: "50px" }}
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
        <div className="mt-auto d-flex flex-row">
          {this.state.owner === this.props.auth.uid && (
            <Button
              variant="outline-primary"
              onClick={this.updatePollItemClicked}
            >
              Add Poll-Items
            </Button>
          )}

          <Button
            className={
              this.state.owner === this.props.auth.uid
                ? "ml-auto"
                : "ml-auto mr-auto"
            }
            variant="outline-primary"
            onClick={() => this.setState({ contributeClicked: true })}
            disabled={this.state.status === "closed"}
          >
            Poll Here
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
                  {new Array(this.state.pollItem.keys.length)
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
                              title=""
                            >
                              {this.state.pollItem.keys.map(cur => (
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
                              title=""
                            >
                              {this.state.pollItem.values.map(cur => (
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
              <small ref="addPollError" className="text-danger mb-2" />
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
