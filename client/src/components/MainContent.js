import React from "react";

import NoMatch from "./NoMatch";
import Login from "./Login";
import Register from "./Register";
import { Switch, Route } from "react-router";
import PrivateRoute from "./common/PrivateRoute";
import XList from "./xlist/index";
import Room from "./room";
import PollItem from "./pollItem";
import Landing from "./Landing";
import Profile from "./Profile";
import Help from "./help";

class MainContent extends React.Component {
  render() {
    return (
      <div className="d-flex flex-column main-content">
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route path="/help" component={Help} />

          <PrivateRoute exact path="/me" component={Profile} />
          <PrivateRoute path="/xlist" component={XList} />
          <PrivateRoute path="/room" component={Room} />
          <PrivateRoute path="/poll-item" component={PollItem} />
          <Route component={NoMatch} />
        </Switch>
      </div>
    );
  }
}

export default MainContent;
