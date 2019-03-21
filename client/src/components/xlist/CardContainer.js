import React from 'react';
import { Tabs, Tab, CardColumns, Button, Form } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { FaPlus } from 'react-icons/fa';

import { logout } from '../../actions/auth';
import VerticallyCenteredModal from '../common/VerticallyCentredModal';
import server from '../../Axios';
import XlistCard from './Card';

class XlistCardContainer extends React.Component {
  isUnmount = false;

  state = {
    myXlists: [],
    otherXlists: [],

    clickedCardName: null,
    clickedCardType: null,
    clickedCardOwner: null,

    // for the error during x-List creation
    addXlistError: null
  };

  componentDidMount() {
    server
      .get('/xlist/me')
      .then(response => {
        if (this.isUnmount) return;
        this.setState({ myXlists: response.data, clickedCardType: 'me' });
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
        this.setState({ myXlists: response.data, clickedCardType: 'me' });
      })
      .catch(err => {
        if (this.isUnmount) return;
        // TODO: logout the user if token mismatches
        console.log('refreshing my xlists: ', err.response);
      });
  };

  refreshOtherXlists = () => {
    server
      .get('/xlist/others')
      .then(response => {
        if (this.isUnmount) return;
        this.setState({
          otherXlists: response.data,
          clickedCardType: 'others'
        });
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
    if (eventKey === 'MyXlists') this.refreshMyXlists();
    else this.refreshOtherXlists();
  };

  onXlistAdd = () => {
    const name = this.refs.xlistName.value;
    server
      .post('/xlist/create', { members: [], name })
      .then(() => {
        if (this.isUnmount) return;
        this.setState({ clickedCardName: name });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response) {
          const res = err.response;
          if (res.status === 400 && res.data.name) {
            this.setState({ addXlistError: res.data.name });
            return;
          }
          if (res.status === 500) this.setState({ addXlistError: res.data });
        }
      });
  };

  render() {
    if (this.state.clickedCardName) {
      if (this.state.clickedCardType === 'me')
        return (
          <Redirect
            to={{
              pathname: `/xlist/me/${this.state.clickedCardName}`
            }}
            push={true}
          />
        );
      return (
        <Redirect
          to={{
            pathname: `/xlist/${this.state.clickedCardOwner}/${
              this.state.clickedCardName
              }`
          }}
          push={true}
        />
      );
    }

    return (
      <Tabs defaultActiveKey="MyXlists" onSelect={this.onTabSelect}>
        <Tab
          eventKey="MyXlists"
          title="My X-Lists"
          onClick={this.refreshMyXlists}
        >
          <div>
            <CardColumns style={{ marginTop: '20px' }} onClick={this.onClick}>
              {this.state.myXlists.map(x => (
                <XlistCard
                  key={x.name}
                  title={x.name}
                  type="me"
                  owner={this.props.auth.uid}
                  lastUpdated={new Date(x.lastUpdated)}
                  members={x.members}
                />
              ))}
            </CardColumns>
            <Button
              className="xlist-add"
              variant="primary"
              onClick={() => this.setState({ addXlistClicked: true })}
            >
              <FaPlus style={{ margin: 'auto' }} />
            </Button>

            <VerticallyCenteredModal
              heading="Add a new X-List"
              show={this.state.addXlistClicked}
              onHide={() => this.setState({ addXlistClicked: false })}
            >
              <div className="d-flex flex-column bg-light">
                <Form.Control
                  type="text"
                  placeholder="X-List name"
                  isInvalid={this.state.addXlistError !== null}
                  ref="xlistName"
                />
                <Form.Control.Feedback type="invalid">
                  {this.state.addXlistError}
                </Form.Control.Feedback>

                <Button
                  variant="outline-success"
                  className="mt-2 ml-auto"
                  onClick={this.onXlistAdd}
                >
                  Create
                </Button>
              </div>
            </VerticallyCenteredModal>
          </div>
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
