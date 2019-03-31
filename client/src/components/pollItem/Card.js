import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import getTimeDifference from '../../utils/getTimeDifference';

class PollItemCard extends React.Component {
  static propTypes = {
    lastUpdated: PropTypes.string.isRequired,
    owner: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  };

  render() {
    return (
      <Card
        border="dark"
        style={{ cursor: "pointer" }}
        id={`${this.props.name}$$${this.props.owner}`}
      >
        {/*
         * this CardId is used at the time when we are setting the onClick
         * on the document (instead of setting the onClick on each of the card)
         * to get the name of the clicked card.
         * And "$$" is the delimeter which is used to split and get the owner's
         * email and card name at the same time
         */}
        <Card.Body>
          <Card.Title className="d-flex flex-row">
            <div className="text-overflow-control">
              <b>{this.props.name}</b>
            </div>
            <div
              style={{ marginLeft: 'auto' }}
              id={`delete$$${this.props.name}`}
            >
              x
            </div>
          </Card.Title>

        </Card.Body>
        <Card.Footer>
          <small className="text-muted">
            Last updated {getTimeDifference(new Date(this.props.lastUpdated))}
          </small>
        </Card.Footer>
      </Card>
    );
  }
}

export default PollItemCard;