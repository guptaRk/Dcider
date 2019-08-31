import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import XList from "./xlist";
import PollItem from "./pollItem";
import Room from "./room";
// import About from "./about";

class Help extends React.Component {
  render() {
    return (
      <Tabs defaultActiveKey="rooms" id="help-ids" className="pl-2">
        {/* <Tab eventKey="home" title="Home">
          <About />
        </Tab> */}
        <Tab eventKey="rooms" title="Room">
          <Room />
        </Tab>
        <Tab eventKey="xList" title="X-List">
          <XList />
        </Tab>
        <Tab eventKey="pollItems" title="Poll-Item">
          <PollItem />
        </Tab>
      </Tabs>
    );
  }
}

export default Help;
