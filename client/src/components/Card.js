import React from 'react';
import PropTypes from 'prop-types';

class Card extends React.Component {
    render() {
        return (
            <div className="card">
                <p>{`Title: ${this.props.title}`}</p>
                <p>{`Date: ${this.props.date}`}</p>
            </div>
        );
    }
}

Card.propTypes = {
    title: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date).isRequired
};

export default Card;