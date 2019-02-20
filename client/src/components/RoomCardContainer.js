import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import RoomCard from './RoomCard';

const initialCardsToDisplay = 1;

class RoomCardContainer extends React.Component {

  state = {
    cardsToDisplay: initialCardsToDisplay
  };

  onViewAll = () => {
    this.setState({ cardsToDisplay: this.props.cards.length });
    this.refs.viewAll.classList.toggle('invisible');
    this.refs.collapse.classList.toggle('invisible');
  }

  onCollapse = () => {
    this.setState({ cardsToDisplay: initialCardsToDisplay });
    this.refs.viewAll.classList.toggle('invisible');
    this.refs.collapse.classList.toggle('invisible');
  }

  render() {

    return (
      <div className="d-flex flex-column mt-2">
        <div className="d-flex flex-row">
          <b className="text-info p-2">{this.props.heading}</b>
          <Button
            ref="viewAll"
            className="ml-auto"
            variant="outline-info"
            onClick={this.onViewAll}>
            View All
        </Button>
        </div>
        <div className="d-flex flex-row flex-wrap">
          {this.props.cards.map((c, ind) =>
            ((ind < this.state.cardsToDisplay) ? <RoomCard {...c} /> : null))}
        </div>
        <Button
          ref="collapse"
          className="mt-3 ml-auto invisible"
          variant="outline-info"
          onClick={this.onCollapse}>
          collapse
        </Button>
      </div>
    );
  }
}

RoomCardContainer.propypes = {
  cards: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    lastUpdated: PropTypes.instanceOf(Date).isRequired,
    type: PropTypes.oneOf(['me', 'others']).isRequired,
    owner: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    membersCount: PropTypes.number.isRequired,
    pollItemCount: PropTypes.number.isRequired,
    usersPolled: PropTypes.number.isRequired,
    borderColor: PropTypes.string.isRequired
  })).isRequired,

  heading: PropTypes.string.isRequired,

};

export default RoomCardContainer;