import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import RoomCardContainer from './RoomCardContainer';

import { Redirect } from 'react-router-dom';
import server from '../Axios';
import { connect } from 'react-redux';
import { logout } from '../actions/auth';

const exampleRoomCardContainerData = {
  cards:
    [{
      title: "abc",
      lastUpdated: new Date(),
      type: "others",
      owner: "abc@xyz.com",
      membersCount: 5,
      usersPolled: 0,
      pollItemCount: 9,
      description: "hello this is a test room develop to test during development phase",
      borderColor: "danger"
    },
    {
      title: "abc",
      lastUpdated: new Date(),
      type: "others",
      owner: "abc@xyz.com",
      membersCount: 5,
      usersPolled: 1,
      pollItemCount: 9,
      description: "hello this is a test room develop to test during development phase",
      borderColor: "success"
    }]
};

class RoomContainer extends React.Component {
  isUnmount = false;

  state = {
    myActiveRooms: [],
    myClosedRooms: [],
    otherActiveRooms: [],
    otherClosedRooms: [],

    // managed in RoomCardContainer to specify that a RoomCard has clciked
    clickedCardIdPlusType: null
  }

  componentWillUnmount() {
    this.isUnmount = true;
  }

  componentDidMount() {
    console.log(this.props.auth);
    this.refreshMyRooms();
  }

  refreshMyRooms = () => {
    const active = server.get('/room/my/active');
    const closed = server.get('/room/my/closed');

    Promise.all([active, closed])
      .then(([active, closed]) => {
        if (this.isUnmount) return;

        // reshape the data according to the props of the <RoomCardContainer />
        active.data = active.data.map(x => {
          return {
            ...x,
            owner: this.props.auth.email,
            type: "me",
            borderColor: "green"
          }
        });

        closed.data = closed.data.map(x => {
          return {
            ...x,
            owner: this.props.auth.email,
            type: "others",
            borderColor: "red"
          }
        })

        this.setState({
          myActiveRooms: active.data,
          myClosedRooms: closed.data
        });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response && err.response.status === 500) alert('Internal Server Error! Try Again.');
        else if (err.response && err.response.status === 400 && err.response.data.token) {
          // Token Expires or Modified by the user explicitly
          this.props.logout();
        }
        else console.log("My Rooms: ", err);
      });
  }

  refreshOtherRooms = () => {
    const active = server.get('/room/others/active');
    const closed = server.get('/room/others/closed');

    Promise.all([active, closed])
      .then(([active, closed]) => {
        if (this.isUnmount) return;
        this.setState({
          otherActiveRooms: active.data,
          otherClosedRooms: closed.data
        });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response && err.response.status === 500) alert('Internal Server Error! Try Again.');
        else if (err.response && err.response.status === 400 && err.response.data.token) {
          // Token Expires or Modified by the user explicitly
          this.props.logout();
        }
        else console.log("Other Rooms: ", err);
      });
  }

  onSelect = (eventKey) => {
    if (eventKey === "myRoom") this.refreshMyRooms();
    else this.refreshOtherRooms();
  }

  // a room card has clicked and we have the url to load onClick here
  handleCardClick = (id, type) => {
    const s = id + "$$" + type;
    this.setState({ clickedCardIdPlusType: s });
  }

  render() {
    console.log(this.props);

    if (this.state.clickedCardIdPlusType) {
      const info = this.state.clickedCardIdPlusType.split("$$");
      return <Redirect to={{
        pathname: `/room/${info[2]}/${info[0]}`,
        state: {
          owner: info[1],
          name: info[0],
          type: info[2]
        }
      }} push />
    }
    return (
      <Tabs
        onSelect={this.onSelect} >
        <Tab eventKey="myRoom" title="My Rooms">
          <div className="d-flex flex-column h-100">
            <RoomCardContainer
              cards={this.state.myActiveRooms}
              heading="Active"
              onCardClick={this.handleCardClick}
              type="me" />
            <hr className="w-100" />
            <RoomCardContainer
              cards={this.state.myClosedRooms}
              heading="Inactive or Completed"
              onCardClick={this.handleCardClick}
              type="me" />
          </div>
        </Tab>
        <Tab eventKey="otherRoom" title="Others">
          <div className="d-flex flex-column h-100">
            <RoomCardContainer {...exampleRoomCardContainerData}
              heading="Active"
              onCardClick={this.handleCardClick}
              type="others" />
            <hr className="w-100" />
            <RoomCardContainer {...exampleRoomCardContainerData}
              heading="Inactive or Completed"
              onCardClick={this.handleCardClick}
              type="others" />
          </div>
        </Tab>
      </Tabs>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth
  };
};

export default connect(mapStateToProps, { logout })(RoomContainer);