import React from 'react';
import {
  Button,
  CardColumns,
  Tab,
  Tabs,
  DropdownButton,
  Dropdown
} from 'react-bootstrap';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import server from '../../Axios';
import RoomCard from './Card';
import { logout } from '../../actions/auth';

class RoomCardContainer extends React.Component {
  isUnmount = false;

  state = {
    currentlySelected: 'Active Rooms',
    currentType: 'my',

    cardClicked: false,
    clickedCardName: '',
    clickedCardOwner: '',

    rooms: []
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
      this.setState({ currentlySelected: 'Active Rooms' });
    else this.setState({ currentlySelected: 'Closed (or Inactive) Rooms' });
    this.refreshRooms(this.state.currentType, eventKey);
  };

  onTabSelect = eventKey => {
    if (eventKey === 'myRooms')
      this.setState({
        currentType: 'my',
        currentlySelected: 'Active Rooms',
        rooms: []
      });
    else
      this.setState({
        currentType: 'others',
        currentlySelected: 'Active Rooms',
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
      this.state.currentlySelected === 'Active Rooms' ? 'green' : 'red';
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
                Active Rooms
              </Dropdown.Item>
              <Dropdown.Item
                as={Button}
                eventKey="closed"
                onSelect={this.dropDownSelect}
              >
                Closed (or Inactive) Rooms
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
                Active Rooms
              </Dropdown.Item>
              <Dropdown.Item
                as={Button}
                eventKey="closed"
                onSelect={this.dropDownSelect}
              >
                Closed (or Inactive) Rooms
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
