import React from 'react';
import { Tabs, Tab } from 'react-bootstrap';
import RoomCardContainer from './RoomCardContainer';

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
      usersPolled: 0,
      pollItemCount: 9,
      description: "hello this is a test room develop to test during development phase",
      borderColor: "success"
    }]
};

class RoomContainer extends React.Component {
  onSelect = () => {

  }

  render() {
    return (
      <Tabs
        onSelect={this.onSelect}>
        <Tab eventKey="myRoom" title="My Rooms">
          <div className="d-flex flex-column h-100">
            <RoomCardContainer {...exampleRoomCardContainerData} heading="Active" />
            <hr className="w-100" />
            <RoomCardContainer {...exampleRoomCardContainerData} heading="Inactive or Completed" />
          </div>
        </Tab>
        <Tab eventKey="otherRoom" title="Others">
          <div className="d-flex flex-column h-100">
            <RoomCardContainer {...exampleRoomCardContainerData} heading="Active" />
            <hr className="w-100" />
            <RoomCardContainer {...exampleRoomCardContainerData} heading="Inactive or Completed" />
          </div>
        </Tab>
      </Tabs>
    );
  }
}

export default RoomContainer;