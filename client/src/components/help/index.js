import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import XList from "./xlist";
import PollItem from "./pollItem";
import Room from "./room";
// import About from "./about";

class Help extends React.Component {
  render() {
    return (
      <Tabs defaultActiveKey="rooms" id="help-ids">
        {/* <Tab eventKey="home" title="Home">
          <About />
        </Tab> */}
        <Tab eventKey="rooms" title="Rooms">
          <Room />
        </Tab>
        <Tab eventKey="xList" title="X-List">
          <XList />
        </Tab>
        <Tab eventKey="pollItems" title="Poll-Items">
          <PollItem />
        </Tab>
      </Tabs>
    );
  }
}

export default Help;
