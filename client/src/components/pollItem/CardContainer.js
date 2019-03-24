import React from 'react';
import { logout } from '../../actions/auth';
import { connect } from 'react-redux';
import { CardColumns, Button, Form } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { Redirect } from 'react-router-dom';

import PollCard from './Card';
import VerticallyCenteredModal from '../common/VerticallyCentredModal';
import server from '../../Axios';

class CardContainer extends React.Component {
  isUnmount = false;

  state = {
    // Data returned from the api itself
    pollItem: [],

    // click listener
    pollItemCardClicked: false,
    clickedCardName: "",
    // this is for the time when we extend this to include 
    // sharing of poll-items list also
    clickedCardOwner: "",

    // adding a new poll-item
    addPollItemClicked: false,
    pollItemNameError: null
  };

  componentDidMount() {
    server.get('/pollItem/all')
      .then(result => {
        if (this.isUnmount) return;
        this.setState({ pollItem: result.data });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response && err.response.status === 400 && err.response.data.token) {
          // Token expires or deleted or edited 
          this.props.logout();
          return;
        }
        // Internal server error
        console.log(err);
      })
  }

  componentWillUnmount() {
    this.isUnmount = true;
  }

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
      .delete(`/pollItem/${name}`)
      .then(() => {
        if (this.isUnmount) return;

        // update the myXlist state
        this.setState(prvState => {
          prvState.pollItem = prvState.pollItem.filter(x => x.name !== name);
          return prvState;
        });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response) {
          if (err.response.status === 400 && err.response.data.token) {
            // Token expires or it is deleted by the user
            this.props.logout();
            return;
          }
          // Internal server error or other errors that are not created
          // due to sending the request from the client side
          console.log(err);
        }
      });
  };

  onClick = e => {
    // clicked the delete button
    if (e.target.id.includes('delete$$')) {
      this.deleteId(e.target);
      return;
    }

    const card = this.clickedInsideCard(e.target);
    if (card) {
      const cardNameAndUId = card.id.split('$$');
      this.setState({
        pollItemCardClicked: true,
        clickedCardName: cardNameAndUId[0],
        clickedCardOwner: cardNameAndUId[1]
      });
    }
  }

  onPollItemCreate = () => {
    const name = this.refs.name.value;
    server.post('/pollItem/create', { name, keys: [], values: [] })
      .then(result => {
        if (this.isUnmount) return;
        this.setState({
          pollItemCardClicked: true,
          clickedCardName: result.data.name,
          clickedCardOwner: result.data.owner
        });
      })
      .catch(err => {
        if (this.isUnmount) return;
        if (err.response) {
          if (err.response.status === 400 && err.response.data.token) {
            // Token expires or it is deleted by the user
            this.props.logout();
            return;
          }
          if (err.response.status === 400 && err.response.data.name) {
            this.setState({ pollItemNameError: err.response.data.name });
            return;
          }
          // Internal server error or other errors that are not created
          // due to sending the request from the client side
          console.log(err);
        }
      });
  }

  render() {
    if (this.state.pollItemCardClicked)
      return <Redirect to={`/poll-item/my/${this.state.clickedCardName}`} push />;

    return (
      <div>
        <CardColumns onClick={this.onClick}>
          {this.state.pollItem.map(x => (
            <PollCard
              key={x.name}
              {...x}
            />
          ))}
        </CardColumns>
        <Button
          className="xlist-add"
          variant="primary"
          onClick={() => this.setState({ addPollItemClicked: true })}
        >
          <FaPlus style={{ margin: 'auto' }} />
        </Button>

        <VerticallyCenteredModal
          heading="Add a new Poll-Items list"
          show={this.state.addPollItemClicked}
          onHide={() => this.setState({ addPollItemClicked: false, pollItemNameError: null })}
        >
          <div className="d-flex flex-column bg-light">
            <Form.Control
              type="text"
              placeholder="Poll-Items List name"
              isInvalid={this.state.pollItemNameError !== null}
              ref="name"
            />
            <Form.Control.Feedback type="invalid">
              {this.state.pollItemNameError}
            </Form.Control.Feedback>

            <Button
              variant="outline-success"
              className="mt-2 ml-auto"
              onClick={this.onPollItemCreate}
            >
              Create
            </Button>
          </div>
        </VerticallyCenteredModal>
      </div >

    );
  }
}

export default connect(null, { logout })(CardContainer);