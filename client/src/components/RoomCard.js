import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

class RoomCard extends React.Component {

  getTimeDifference = () => {
    let diff = (Date.now() - this.props.lastUpdated) / 1000;
    if (diff < 60) return (diff.toFixed(0) + " sec ago");
    diff /= 60;
    if (diff < 60) return (diff.toFixed(0) + " min ago");
    diff /= 60;
    if (diff < 24) return (diff.toFixed(0) + " hr ago");
    diff /= 24;
    if (diff < 24) return (diff.toFixed(0) + " days ago");
    diff /= 30;
    if (diff < 30) return (diff.toFixed(0) + " months ago");
    diff /= 12;
    if (diff < 12) return (diff.toFixed(0) + " years ago");
    return ("more than 12 year ago");
  }

  render() {
    return (
      <Card border={this.props.borderColor} className="mt-3" style={{ cursor: "pointer" }}>
        <Card.Header>{this.props.title}</Card.Header>
        <Card.Body>
          {this.props.type === 'others' &&
            <p className="border border-info p-2 text-dark bg-light">
              By <b>{this.props.owner}</b>
            </p>}
          <Card.Text className="text-info">{this.props.description}</Card.Text>

          <hr />
          <ListGroup>
            <ListGroup.Item variant="light">
              Currently {this.props.membersCount} members
            </ListGroup.Item>
            <ListGroup.Item variant="light">
              Currently {this.props.pollItemCount} poll items
            </ListGroup.Item>
            {this.props.usersPolled !== 0 &&
              <ListGroup.Item variant="light">
                {this.props.usersPolled} users had already polled
            </ListGroup.Item>}
          </ListGroup>

        </Card.Body >
        <Card.Footer>
          <small className="text-muted">
            Last updated {this.getTimeDifference()}
          </small>
        </Card.Footer>
      </Card >
    );
  }
}

RoomCard.propTypes = {
  title: PropTypes.string.isRequired,
  lastUpdated: PropTypes.instanceOf(Date).isRequired,
  type: PropTypes.oneOf(['me', 'others']).isRequired,
  owner: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  membersCount: PropTypes.number.isRequired,
  pollItemCount: PropTypes.number.isRequired,
  usersPolled: PropTypes.number.isRequired,
  borderColor: PropTypes.string.isRequired
}

export default RoomCard;