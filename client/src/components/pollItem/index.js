import React from "react";
import { Route } from "react-router-dom";

import CardContainer from "./CardContainer";
import Display from "./Display";

class Room extends React.Component {
  render() {
    return (
      <div className="w-100 h-100 p-3">
        <Route exact path="/poll-item" component={CardContainer} />
        <Route exact path="/poll-item/:type/:name" component={Display} />
      </div>
    );
  }
}

export default Room;
