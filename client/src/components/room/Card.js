import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

import getTimeDifference from '../../utils/getTimeDifference';

class RoomCard extends React.Component {
  static propTypes = {
    borderColor: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    lastUpdated: PropTypes.string.isRequired,
    membersCount: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    owner: PropTypes.string.isRequired,
    pollItemCount: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['my', 'others']).isRequired,
    usersPolled: PropTypes.number.isRequired
  };

  render() {
    return (
      // ID is used at the time of click to grab the name and owner
      <Card
        border={this.props.borderColor}
        className="mt-3"
        style={{ cursor: 'pointer' }}
        id={`${this.props.name}$$${this.props.owner}`}
      >
        <Card.Header>{this.props.name}</Card.Header>
        <Card.Body>
          {this.props.type === 'others' && (
            <p className="border border-info p-2 text-dark bg-light">
              By <b>{this.props.owner}</b>
            </p>
          )}
          <Card.Text className="text-info">{this.props.description}</Card.Text>

          <hr />
          <ListGroup>
            <ListGroup.Item variant="light">
              Currently {this.props.membersCount} members
            </ListGroup.Item>
            <ListGroup.Item variant="light">
              Currently {this.props.pollItemCount} poll items
            </ListGroup.Item>
            {this.props.usersPolled !== 0 && (
              <ListGroup.Item variant="light">
                {this.props.usersPolled} users had already polled
              </ListGroup.Item>
            )}
          </ListGroup>
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

export default RoomCard;
