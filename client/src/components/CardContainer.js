import React from 'react';
import Card from './Card';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

import { connect } from 'react-redux';

class CardContainer extends React.Component {

    state = {
        cardToDisplay: this.props.initialCardsToDisplay
    };

    getCardsJSX = (numberOfCardsToDisplay) => {
        return this.props.cards.map((card, ind) => {
            if (ind < numberOfCardsToDisplay)
                return (<Card title={card.title} date={card.date} />);
            return null;
        });
    }

    buttonClick = (e) => {
        this.setState({
            cardToDisplay:
                (e.target.name === "collapse") ?
                    this.props.initialCardsToDisplay :
                    this.props.cards.length
        });
        this.refs.viewAll.classList.toggle("invisible");
        this.refs.collapse.classList.toggle("invisible");
    }

    render() {

        const displayCards = this.getCardsJSX(this.state.cardToDisplay);

        return (
            <div className=
                {`d-flex flex-column`}>

                <div
                    className="d-flex flex-row flex-wrap"
                    style={{ margin: "20px" }}>
                    <h3 style={{ "flex": "1 0 auto" }}> Title </h3>
                    <Button
                        variant="outline-primary"
                        onClick={this.buttonClick}
                        ref="viewAll">
                        View All
                    </Button>
                </div>

                <div className=
                    "d-flex flex-row flex-wrap justify-content-center flex-grow-1">
                    {displayCards}
                </div>

                <div className="d-flex justify-content-end">
                    <Button
                        variant="outline-primary"
                        className="invisible"
                        ref="collapse"
                        name="collapse"
                        onClick={this.buttonClick}>
                        Collapse
                </Button>
                </div>

            </div >
        );
    }
}

CardContainer.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        date: PropTypes.instanceOf(Date).isRequired
    })).isRequired,

};

const mapStateToProps = (state) => {
    return {
        initialCardsToDisplay: state.initialCardsToDisplay
    };
}

export default connect(mapStateToProps)(CardContainer);