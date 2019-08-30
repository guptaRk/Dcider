import React from "react";
import { Alert, ListGroup } from "react-bootstrap";

class Room extends React.Component {
  render() {
    return (
      <div className="mt-3">
        <Alert variant="info">Rooms</Alert>
        <div className="bg-light p-4">
          <b>
            This is the primary place where you can create a poll and add
            members and poll-items to them.
          </b>{" "}
          <br />
          It has several cool features -
          <ListGroup className="mt-3">
            <ListGroup.Item>
              Everytime you create a room (for poll) you don't need to add all
              the members one by one from scratch. You can take the help of{" "}
              <b>X-Lists</b> to create a group of frequently used members and
              add them to you poll by just a click!
              <br />
              <br /> Afterwards you can customize according to your choice by
              adding (or removing) some members.
            </ListGroup.Item>
            <ListGroup.Item>
              You may want to re-use a list of members from a <b>room</b> you
              are a part of. So, you can <b>clone</b> it's <b>X-List</b> and
              make a copy of it. Now, you can use it in your own <b>room</b>!
            </ListGroup.Item>
            <ListGroup.Item>
              Similarly, you can create a separate <b>Poll-Item</b> list and
              reuse it in every polls you want.
            </ListGroup.Item>
            <ListGroup.Item>
              Remember that you can't use same name for two <b>rooms</b>
            </ListGroup.Item>
          </ListGroup>
        </div>
      </div>
    );
  }
}

export default Room;
