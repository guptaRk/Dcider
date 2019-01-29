import React from 'react';
import Card from './Card';

class CardContainer extends React.Component {
    render() {
        return (
            <div className=
                "d-flex flex-row flex-wrap justify-content-center">
                < Card />
                <Card />
                <Card />
                <Card />
                <Card />
                <Card />
                <Card />
            </div >
        );
    }
}

export default CardContainer;