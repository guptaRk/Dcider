import React from "react";
import { Route } from "react-router-dom";

import Container from "./Container";
import Display from "./Display";

class Room extends React.Component {
  render() {
    return (
      <div className="w-100 h-100 p-3">
        <Route exact path="/room" component={Container} />
        <Route exact path="/room/:type/:name" component={Display} />
      </div>
    );
  }
}

export default Room;
