import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import getTimeDifference from '../../utils/getTimeDifference';
import './index.css';

class XlistCard extends React.Component {
  static propTypes = {
    lastUpdated: PropTypes.instanceOf(Date).isRequired,
    members: PropTypes.arrayOf(String).isRequired,
    owner: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired // can be either 'me' or 'others'
  };

  render() {
    return (
      <Card
        border="dark"
        style={{ cursor: 'pointer' }}
        id={`${this.props.title}$$${this.props.owner}`}
      >
        {/*
         * this CardId is used at the time when we are setting the onClick
         * on the document (instead of setting the onClick on each of the card)
         * to get the name of the clicked card.
         * If user is logged in but not verified, show please wait button
         * If user is not logged in, show sign in button.
         * And "$$" is the delimeter which is used to split and get the owner's
         * email and card name at the same time
         */}
        <Card.Body>
          <Card.Title className="d-flex flex-row">
            <div className="text-overflow-control">
              <b>{this.props.title}</b>
            </div>
            {this.props.type === 'me' && (
              <div
                style={{ marginLeft: 'auto' }}
                id={`delete$$${this.props.title}`}
              >
                x
              </div>
            )}
          </Card.Title>
          <hr />
          <Card.Subtitle>
            <b>Members :</b>{' '}
          </Card.Subtitle>

          <ul>
            {this.props.members.map(x => (
              <li key={x} className="text-overflow-control">
                {x}
              </li>
            ))}
          </ul>
        </Card.Body>
        <Card.Footer>
          <small className="text-muted">
            Last updated {getTimeDifference(this.props.lastUpdated)}
          </small>
        </Card.Footer>
      </Card>
    );
  }
}

export default XlistCard;
