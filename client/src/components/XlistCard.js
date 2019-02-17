import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';

class XlistCard extends React.Component {

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
      <Card
        border="dark"
        style={{ cursor: "pointer" }}
        onClick={this.onClick}
        id={this.props.title}>
        <Card.Body>
          <Card.Title><i><b>{this.props.title}</b></i></Card.Title>
          <hr />
          <Card.Subtitle><b>Members :</b> </Card.Subtitle>

          <ul>
            {this.props.members.map((x, ind) => (<li key={`card${ind}`}>{x}</li>))}
          </ul>

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

XlistCard.propTypes = {
  title: PropTypes.string.isRequired,
  lastUpdated: PropTypes.instanceOf(Date).isRequired,
  members: PropTypes.arrayOf(String).isRequired,
};

export default XlistCard;