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
        id={`${this.props.title}$$${this.props.owner}`}>
        {/* this CardId is used at the time when we are setting the onClick on the document (instead of setting the onClick on each of the card) to get the name of the clicked card
        And "$$" is the delimeter which is used to split and get the owner's email and card name at the same time
        */}
        <Card.Body>
          <Card.Title className="d-flex flex-row">
            <i><b>{this.props.title}</b></i>
            {this.props.type === "me" &&
              <div
                style={{ marginLeft: "auto" }}
                id={`delete$$${this.props.title}`}>
                x
              </div>}
          </Card.Title>
          <hr />
          <Card.Subtitle><b>Members :</b> </Card.Subtitle>

          <ul>
            {this.props.members.map((x, ind) => (<li key={`card${ind}`}>{x}</li>))}
          </ul>
          {this.props.type === 'others' &&
            <p><b>Owner: </b><i style={{ color: "lightblue" }}>{this.props.owner}</i></p>
          }
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
  owner: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired     // can be either 'me' or 'others'
};

export default XlistCard;