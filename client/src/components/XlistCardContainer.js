import React from 'react';
import { Tabs, Tab, CardColumns } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { logout } from '../actions/auth';
import server from '../Axios';
import XlistCard from './XlistCard';

class XlistCardContainer extends React.Component {
  isUnmount = false;

  state = {
    myXlists: [],
    otherXlists: [],

    clickedCardName: null,
    clickedCardType: null,
    clickedCardOwner: null
  };

  componentDidMount() {
    server
      .get('/xlist/me')
      .then(response => {
        if (this.isUnmount) return;
        this.setState({
          myXlists: response.data,
          clickedCardType: 'me'
        });
      })
      .catch(err => {
        if (this.isUnmount) return;
        console.log(err.response);
        if (err.response) {
          const res = err.response;
          if (res.status === 400) {
            /*
             * token is incorrect or not sent!
             * so logout the user and the privateRoute will take care of the
             * fact that after login user lands here directly!
             */
            this.props.logout();
          }
        }
      });
  }

  componentWillUnmount() {
    this.isUnmount = true;
  }

  refreshMyXlists = () => {
    server
      .get('/xlist/me')
      .then(response => {
        if (this.isUnmount) return;
        this.setState({ myXlists: response.data });
      })
      .catch(err => {
        if (this.isUnmount) return;
        console.log('refreshing my xlists: ', err.response);
      });
  };

  refreshOtherXlists = () => {
    server
      .get('/xlist/others')
      .then(response => {
        if (this.isUnmount) return;
        this.setState({ otherXlists: response.data });
      })
      .catch(err => {
        if (this.isUnmount) return;
        console.log('refreshing others list: ', err);
      });
  };

  clickedInsideCard = node => {
    while (node) {
      if (node.classList.contains('card')) return node;
      node = node.parentElement;
    }
    return null;
  };

  deleteId = element => {
    const name = element.id.split('$$')[1];
    server
      .delete(`/xlist/me/${name}`)
      .then(() => {
        if (this.isUnmount) return;

        // update the myXlist state
        this.setState(prvState => {
          prvState.myXlists.filter(x => x.name !== name);
          return {
            myXlist: { ...prvState.myXlist }
          };
        });
      })
      .catch(err => {
        if (this.isUnmount) return;
        console.log('deleting xlist: ', err);
        if (err.response) {
          alert(err.response.data);
        }
      });
  };

  onClick = e => {
    e.preventDefault();

    // clicked the delete button
    if (e.target.id.includes('delete$$')) {
      this.deleteId(e.target);
      return;
    }

    const card = this.clickedInsideCard(e.target);
    if (card) {
      console.log(card.id);
      const cardNameAndEmail = card.id.split('$$');
      this.setState({
        clickedCardName: cardNameAndEmail[0],
        clickedCardOwner: cardNameAndEmail[1]
      });
    }
  };

  onTabSelect = eventKey => {
    if (eventKey === 'MyXlists') {
      this.refreshMyXlists();
      this.setState({ clickedCardType: 'me' });
    } else {
      this.refreshOtherXlists();
      this.setState({ clickedCardType: 'others' });
    }
  };

  convertArrayToString = arr => {
    let str = '';
    for (let j = 0; j < arr.length; j += 1) {
      const i = arr[j];
      str += `${i}\n`;
    }
    return str;
  };

  render() {
    if (this.state.clickedCardName) {
      return (
        <Redirect
          to={{
            pathname: `/xlist/${this.state.clickedCardType}/${
              this.state.clickedCardName
              }`,
            state: {
              owner: this.state.clickedCardOwner,
              type: this.state.clickedCardType,
              name: this.state.clickedCardName
            }
          }}
          push={true}
        />
      );
    }
    console.log('auth : ', this.props.auth);
    return (
      <Tabs defaultActiveKey="MyXlists" onSelect={this.onTabSelect}>
        <Tab
          eventKey="MyXlists"
          title="My XLists"
          onClick={this.refreshMyXlists}
        >
          <CardColumns style={{ marginTop: '20px' }} onClick={this.onClick}>
            {this.state.myXlists.map(x => (
              <XlistCard
                key={x.name}
                title={x.name}
                type="me"
                owner={this.props.auth.email}
                lastUpdated={new Date(x.lastUpdated)}
                members={x.members}
              />
            ))}
          </CardColumns>
        </Tab>
        <Tab eventKey="others" title="Others" onClick={this.refreshOtherXlists}>
          <CardColumns style={{ marginTop: '20px' }} onClick={this.onClick}>
            {this.state.otherXlists.map(x => (
              <XlistCard
                key={x}
                title={x.name}
                type="others"
                owner={x.owner}
                lastUpdated={new Date(x.lastUpdated)}
                members={x.members}
              />
            ))}
          </CardColumns>
        </Tab>
      </Tabs>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth
  };
};

export default connect(
  mapStateToProps,
  { logout }
)(XlistCardContainer);
