import React from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';

class Cards extends React.Component {

    getTimeDifference = () => {
        let diff = (Date.now() - this.props.dateCreated) / 1000;
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
                style={{ cursor: "pointer" }}
                onClick={this.onClick}>
                <Card.Body>
                    <Card.Title>{this.props.title}</Card.Title>
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
    dateCreated: PropTypes.instanceOf(Date).isRequired,
    text: PropTypes.string,
    type: PropTypes.string.isRequired,
    _id: PropTypes.string.isRequired
};

export default Cards;