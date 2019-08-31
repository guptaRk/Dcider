import React from "react";
import { Alert, ListGroup } from "react-bootstrap";

class PollItems extends React.Component {
  render() {
    return (
      <div className="mt-3 p-2">
        <Alert variant="info">Poll-Items</Alert>
        <div className="bg-light p-4">
          <ListGroup className="mt-3">
            <ListGroup.Item>
              It is the place where you can group a list of polling items (
              <b>basically a key and a value</b>) and use it (
              <b>
                to add all the polling items present in this group directly to
                poll
              </b>
              ) later while creating a poll.
            </ListGroup.Item>
            <ListGroup.Item>
              You can add or remove polling items from a particular group
              anytime you want. <br />
              <br />
              <b>
                But remember if you had used this Poll-Item in any of the room
                and after that you are adding (or removing) a member in this
                Poll-Item then that Key-Value pair will not be added (or
                removed) from the room!
              </b>
            </ListGroup.Item>
            <ListGroup.Item>
              Remember that you can't use same name for two <b>poll-items</b>
            </ListGroup.Item>
          </ListGroup>
        </div>
      </div>
    );
  }
}

export default PollItems;
