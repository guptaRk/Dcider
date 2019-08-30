import React from "react";
import { Alert, ListGroup } from "react-bootstrap";

class XList extends React.Component {
  render() {
    return (
      <div className="mt-3">
        <Alert variant="info">X-Lists</Alert>
        <div className="bg-light p-4">
          <ListGroup className="mt-3">
            <ListGroup.Item>
              It is the place where you can group a list of members and use it (
              <b>
                to add all the members present in this group directly to poll
              </b>
              ) later while creating a poll.
            </ListGroup.Item>
            <ListGroup.Item>
              You can add or remove members anytime you want. <br />
              <br />
              <b>
                But remember if you had used this X-List in any of the room and
                after that you are adding (or removing) a member in this X-List
                then that member will not be added (or removed) from the room!
              </b>
            </ListGroup.Item>
            <ListGroup.Item>
              You can <b>clone</b> any <b>X-List</b> from the room in which you
              are a member of and then customize it according to your choice!{" "}
              <br /> <br />
              You can find this option in the <b>others</b> tab in the{" "}
              <b>X-List</b> page.
            </ListGroup.Item>
            <ListGroup.Item>
              Remember that you can't use same name for two <b>x-lists</b>
            </ListGroup.Item>
          </ListGroup>
        </div>
      </div>
    );
  }
}

export default XList;
