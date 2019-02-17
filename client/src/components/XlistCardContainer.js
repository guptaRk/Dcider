import React from 'react';
import { Tabs, Tab, CardColumns } from 'react-bootstrap';
import server from '../Axios';
import XlistCard from './XlistCard';
import { Redirect } from 'react-router-dom';

import { logout } from '../actions/auth';
import { connect } from 'react-redux';

class XlistCardContainer extends React.Component {

  state = {
    myXlists: [],
    otherXlists: [],
    clickedCardName: null
  };

  componentDidMount() {
    server.get('/xlist/me')
      .then(response => {
        this.setState({ myXlists: response.data });
      })
      .catch(err => {
        console.log(err.response);
        if (err.response) {
          const res = err.response;
          if (res.status === 400) {
            // token is incorrect or not sent!
            // so logout the user and the privateRoute will take care of the fact that after 
            // login user lands here directly!
            this.props.logout();
          }
        }
      });
  }

  refreshMyXlists = () => {
    server.get('/xlist/me')
      .then(response => this.setState({ myXlists: response.data }))
      .catch(err => console.log("refreshing my xlists: ", err.response));
  }

  refreshOtherXlists = () => {
    server.get('/xlist/others')
      .then(response => this.setState({ otherXlists: response.data }))
      .catch(err => console.log("refreshing others list: ", err));
  }

  clickedInsideCard = (node) => {
    while (node) {
      if (node.classList.contains('card')) return node;
      node = node.parentElement;
    }
    return null;
  }

  onClick = (e) => {
    e.preventDefault();

    const card = this.clickedInsideCard(e.target);
    if (card) {
      console.log(card.id);
      this.setState({ clickedCardName: card.id });
    }

  }

  onTabSelect = (eventKey) => {
    if (eventKey === 'MyXlists') this.refreshMyXlists();
    else this.refreshOtherXlists();
  }

  convertArrayToString = (arr) => {
    let str = "";
    for (let i of arr)
      str += `${i}\n`;
    return str;
  }

  render() {
    if (this.state.clickedCardName) {
      return <Redirect to={`/xlist/me/${this.state.clickedCardName}`} />
    }
    return (
      <Tabs
        defaultActiveKey="MyXlists"
        onSelect={this.onTabSelect}>
        <Tab eventKey="MyXlists" title="My XLists" onClick={this.refreshMyXlists}>
          <CardColumns style={{ "marginTop": "20px" }} onClick={this.onClick}>
            {this.state.myXlists.map((x, ind) =>
              (<XlistCard
                key={`myCard${ind}`}
                title={x.name}
                lastUpdated={new Date(x.lastUpdated)}
                members={x.members} />))}
          </CardColumns>
        </Tab>
        <Tab eventKey="others" title="Others" onClick={this.refreshOtherXlists}>
          <CardColumns style={{ "marginTop": "20px" }} onClick={this.onClick}>
            {this.state.otherXlists.map((x, ind) =>
              (<XlistCard
                key={`othersCard${ind}`}
                title={x.name}
                lastUpdated={new Date(x.lastUpdated)}
                members={x.members} />))}
          </CardColumns>
        </Tab>
      </Tabs>
    );
  }
}

export default connect(null, { logout })(XlistCardContainer);