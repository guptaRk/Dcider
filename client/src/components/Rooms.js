import React from 'react';
import { Tab, Tabs, CardColumns } from 'react-bootstrap';
import Cards from './common/Card';
import { Redirect } from 'react-router-dom';
import Scrollspy from './Scrollspy';

class Rooms extends React.Component {

  state = {
    click: false,
  };

  clickedInsideCard = (node) => {
    while (node.classList.contains('card-columns') === false) {
      if (node.classList.contains('card')) return true;
      node = node.parentElement;
      if (!node) break;
    }
    return false;
  }

  onClick = (e) => {
    e.preventDefault();
    console.log(e.target, ", ", this);

    if (this.clickedInsideCard(e.target))
      this.setState((prvState) => {
        console.log('card clicked!');
        return {
          click: !prvState.click
        }
      });
  }

  render() {
    const redirect = null;/*= ((this.state.click) ?
      (<Redirect push
        to={`/${this.props.type}/${this.props.title}`}
        component={} />) :
      null);*/

    console.log(redirect);

    return (
      <div>
        {redirect}
        <Tabs defaultActiveKey="ActiveRooms">
          <Tab eventKey="ActiveRooms" title="Active Rooms">
            <CardColumns style={{ "margin-top": "20px" }} onClick={this.onClick}>
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
              <Cards title="abcd" dateCreated={Date.now()} />
            </CardColumns>
          </Tab>
          <Tab eventKey="PastRooms" title="Past Rooms">
          </Tab>
          <Tab eventKey="OwnRooms" title="My Rooms">
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default Rooms;