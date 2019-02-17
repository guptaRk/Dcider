import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';

class Cards extends React.Component {

  getTimeDifference = () => {
    let diff = (Date.now() - this.props.lastUpdated) / 1000;
    if (diff < 60) return (diff.toFixed(0) + " sec ago");
    diff /= 60;
    if (diff < 60) return (diff.toFixed(0) + " min ago");
    diff /= 60;
    if (diff < 60) return (diff.toFixed(0) + " hr ago");
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
      <Card
        border="dark"
        style={{ cursor: "pointer" }}
        onClick={this.onClick}>
        <Card.Body>
          <Card.Title>{this.props.title}</Card.Title>
          <hr />
          <Card.Subtitle><b>Members :</b> </Card.Subtitle>
          <Card.Text>{this.props.text}</Card.Text>
        </Card.Body>
        <Card.Footer>
          <small className="text-muted">
            Last updated {this.getTimeDifference()}
          </small>
        </Card.Footer>
      </Card>
    );
  }
}

Cards.propTypes = {
  title: PropTypes.string.isRequired,
  lastUpdated: PropTypes.instanceOf(Date).isRequired,
  text: PropTypes.string,
};

export default Cards;