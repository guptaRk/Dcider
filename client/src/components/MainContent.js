import React from 'react';
import CardContainer from './CardContainer';
import RoomInit from './RoomInit';
import KeyValuePairsInput from './KeyValuePairsInput';
import Rooms from './Rooms';

import NoMatch from './NoMatch';
import Login from './Login';
import Register from './Register';
import { Switch, Route } from 'react-router';

class MainContent extends React.Component {
  render() {
    /*<div className="h-100 d-flex flex-grow-1 flex-column">
                    <CardContainer
                        cards={[{ title: "abcd", date: "1234" },
                        { title: "abcd", date: "1234" },
                        { title: "abcd", date: "1234" },
                        { title: "abcd", date: "1234" }]} />

                    <hr style={{ width: "100%" }} />

                    <CardContainer
                        cards={[{ title: "abcd", date: "1234" }]} />
                </div>

                <RoomInit />

                <KeyValuePairsInput
                    title="Get The Title From the RoomInit component"
                    items={5} />

        <Rooms />*/

    return (
      <div className="d-flex flex-column main-content main-content-without-footer">
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/register" component={Register} />
          <Route component={NoMatch} />
        </Switch>
      </div>
    );
  }
}

export default MainContent;