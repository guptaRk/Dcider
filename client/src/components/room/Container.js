import React from 'react';
import {
  Button,
  CardColumns,
  Tab,
  Tabs,
  DropdownButton,
  Dropdown,
  Form,
  Row,
  Col
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

import server from '../../Axios';
import RoomCard from './Card';
import { logout } from '../../actions/auth';
import VerticallyCenteredModal from '../common/VerticallyCentredModal';

class RoomCardContainer extends React.Component {
  isUnmount = false;

  state = {
    currentlySelected: 'Active',
    currentType: 'my',

    cardClicked: false,
    clickedCardName: '',
    clickedCardOwner: '',

    rooms: [],

    // adding a new room
    addRoomClicked: false,
    xlists: [],
    pollItems: [],
    nameError: null,
    descriptionError: null,
    roomCreateSuccess: false  // has simulated cardClicked for this
  };

  componentDidMount() {
    server
      .get('/room/my/all/active')
      .then(result => {
        if (this.isUnmount) return;
        this.setState({ rooms: result.data });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response.status === 400) {
          // Invalid token-id or token not passed
          this.props.logout();
        }
        // Internal server error
      });
  }

  componentWillUnmount() {
    this.isUnmount = true;
  }

  // returns the card instance in case a card is clicked otherwise returns null
  isCardClicked = element => {
    while (element && !element.classList.contains('card')) {
      element = element.parentElement;
    }
    return element;
  };

  handleClick = event => {
    if (event.target.id && event.target.id.includes('delete$$')) {
      const deleteCardName = event.target.id.split('$$')[1];

      // delete the room
      server.delete(`/room/${deleteCardName}`)
        .then(() => {
          if (this.isUnmount) return;

          // remove the room locally and saves a db query
          this.setState(prvState => {
            prvState.rooms.filter(x => x.name !== deleteCardName);
            return prvState;
          })
        })
        .catch(err => {
          if (this.isUnmount) return;
          if (err.response.status === 400 && err.response.data.token) {
            // Invalid token-id or token not passed
            this.props.logout();
          }
        });
      return;
    }

    const card = this.isCardClicked(event.target);
    if (!card) return;
    const nameAndOwner = card.id.split('$$');
    this.setState({
      cardClicked: true,
      clickedCardName: nameAndOwner[0],
      clickedCardOwner: nameAndOwner[1]
    });
  };

  refreshRooms = (type, status) => {
    const requestString = `/room/${type}/all/${status}`;

    server
      .get(requestString)
      .then(result => {
        if (this.isUnmount) return;
        this.setState({ rooms: result.data });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response.status === 400) {
          // Invalid token-id or token not passed
          this.props.logout();
        }
        // Internal server error
      });
  };

  dropDownSelect = eventKey => {
    if (eventKey === 'active')
      this.setState({ currentlySelected: 'Active' });
    else this.setState({ currentlySelected: 'Closed' });
    this.refreshRooms(this.state.currentType, eventKey);
  };

  addRoomClicked = () => {
    // fetch all the xlist 
    server.get('/xlist/me')
      .then(response => {
        if (this.isUnmount) return;

        // set the name of the xlists
        this.setState({ xlists: response.data.map(x => x.name) });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response && err.response.data.token) {
          // Token expires or deleted
          this.props.logout();
        }
      });

    // fetch all the poll-items
    server.get('/pollItem/all')
      .then(response => {
        if (this.isUnmount) return;

        // set the name of all the poll-items
        this.setState({ pollItems: response.data.map(x => x.name) });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response && err.response.data.token) {
          // Token expires or deleted
          this.props.logout();
        }
      });

    this.setState({ addRoomClicked: true });
  };

  onRoomCreate = e => {
    e.preventDefault();
    const xlist = this.refs.roomXlist.value;
    const description = this.refs.roomDescription.value;
    const pollItem = this.refs.roomPollItem.value;
    const name = this.refs.roomName.value;

    console.log(xlist, description, pollItem, name);

    server.post('/room/create', { name, description, pollItem, xlist })
      .then((response) => {
        if (this.isUnmount) return;
        this.setState({
          roomCreateSuccess: true,
          cardClicked: true,
          clickedCardName: response.data.name,
          clickedCardOwner: response.data.owner
        });
      })
      .catch(err => {
        console.log(err.response);
        if (this.isUnmount) return;
        if (err.response && err.response.data.token) {
          // Token expires or deleted
          this.props.logout();
          return;
        }
        if (err.response.status === 400 && err.response.data.name) {
          this.setState({ nameError: err.response.data.name });
          return;
        }
        if (err.response.status === 400 && err.response.data.description) {
          this.setState({ descriptionError: err.response.data.description });
          return;
        }
      });

  }

  onTabSelect = eventKey => {
    if (eventKey === 'myRooms')
      this.setState({
        currentType: 'my',
        currentlySelected: 'Active',
        rooms: []
      });
    else
      this.setState({
        currentType: 'others',
        currentlySelected: 'Active',
        rooms: []
      });
    this.refreshRooms(eventKey === 'myRooms' ? 'my' : 'others', 'active');
  };

  render() {
    if (this.state.cardClicked) {
      const type =
        this.state.currentType === 'my' ? 'my' : this.state.clickedCardOwner;
      return (
        <Redirect
          to={`/room/${type}/${this.state.clickedCardName}`}
          push="true"
        />
      );
    }

    const borderColor =
      this.state.currentlySelected === 'Active' ? 'green' : 'red';
    return (
      <Tabs defaultActiveKey="myRooms" onSelect={this.onTabSelect}>
        <Tab title="My Rooms" eventKey="myRooms">
          <div className="d-flex flex-column">
            <DropdownButton
              variant="outline-info"
              className="ml-auto"
              alignRight
              title={this.state.currentlySelected}
            >
              <Dropdown.Item
                as={Button}
                eventKey="active"
                onSelect={this.dropDownSelect}
              >
                Active
              </Dropdown.Item>
              <Dropdown.Item
                as={Button}
                eventKey="closed"
                onSelect={this.dropDownSelect}
              >
                Closed
              </Dropdown.Item>
            </DropdownButton>

            <CardColumns onClick={this.handleClick}>
              {this.state.rooms.map(x => (
                <RoomCard
                  {...x}
                  key={x.name}
                  owner={this.props.auth.uid}
                  borderColor={borderColor}
                  type="my"
                />
              ))}
            </CardColumns>

            <Button
              className="xlist-add"
              variant="primary"
              onClick={this.addRoomClicked}
            >
              <FaPlus style={{ margin: 'auto' }} />
            </Button>

            <VerticallyCenteredModal
              heading="Create a room"
              show={this.state.addRoomClicked}
              onHide={() => this.setState({ addRoomClicked: false })}
            >
              <Form>
                <Form.Group as={Row}>
                  <Form.Label column sm="3">Name</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      ref="roomName"
                      type="text"
                      isInvalid={this.state.nameError !== null}
                      placeholder="Room name"
                    />
                    <Form.Control.Feedback type="invalid">
                      {this.state.nameError}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>

                <Form.Group as={Row}>
                  <Form.Label column sm="3">Description</Form.Label>
                  <Col sm={9}>
                    <Form.Control
                      ref="roomDescription"
                      as="textarea"
                      isInvalid={this.state.descriptionError !== null}
                      placeholder="Description"
                    />
                    <Form.Control.Feedback type="invalid">
                      {this.state.descriptionError}
                    </Form.Control.Feedback>
                  </Col>
                </Form.Group>

                <Form.Group as={Row}>
                  <Form.Label column sm="3">X-List </Form.Label>
                  <Col sm={9}>
                    <Form.Control as="select" ref="roomXlist">
                      {this.state.xlists.map(x => (
                        <option key={x}>{x}</option>
                      ))}
                    </Form.Control>
                  </Col>
                </Form.Group>

                <Form.Group as={Row}>
                  <Form.Label column sm="3">Poll-Items </Form.Label>
                  <Col sm={9}>
                    <Form.Control as="select" ref="roomPollItem">
                      {this.state.pollItems.map(x => (
                        <option key={x}>{x}</option>
                      ))}
                    </Form.Control>
                  </Col>
                </Form.Group>
                <div className="d-flex flex-row">
                  <Button variant="outline-success" type="submit" onClick={this.onRoomCreate} className="ml-auto">
                    Create
                </Button>
                </div>
              </Form>
            </VerticallyCenteredModal>

          </div>
        </Tab>
        <Tab title="Other Rooms" eventKey="otherRooms">
          <div className="d-flex flex-column">
            <DropdownButton
              variant="outline-info"
              className="ml-auto"
              alignRight
              title={this.state.currentlySelected}
            >
              <Dropdown.Item
                as={Button}
                eventKey="active"
                onSelect={this.dropDownSelect}
              >
                Active
              </Dropdown.Item>
              <Dropdown.Item
                as={Button}
                eventKey="closed"
                onSelect={this.dropDownSelect}
              >
                Closed
              </Dropdown.Item>
            </DropdownButton>

            <CardColumns onClick={this.handleClick}>
              {this.state.rooms.map(x => (
                <RoomCard
                  {...x}
                  key={`${x.name}$$${x.owner}`}
                  borderColor={borderColor}
                  type="others"
                />
              ))}
            </CardColumns>
          </div>
        </Tab>
      </Tabs>
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
)(RoomCardContainer);
