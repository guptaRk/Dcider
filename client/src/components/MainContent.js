import React from 'react';
import CardContainer from './CardContainer';
import RoomInit from './RoomInit';
import KeyValuePairsInput from './KeyValuePairsInput';
import Rooms from './Rooms';

class MainContent extends React.Component {
    render() {
        return (
            <div className="d-flex flex-column main-content main-content-without-footer">

                {/*<div className="h-100 d-flex flex-grow-1 flex-column">
                    <CardContainer
                        cards={[{ title: "abcd", date: "1234" },
                        { title: "abcd", date: "1234" },
                        { title: "abcd", date: "1234" },
                        { title: "abcd", date: "1234" }]} />

                    <hr style={{ width: "100%" }} />

                    <CardContainer
                        cards={[{ title: "abcd", date: "1234" }]} />
                </div>*/}

                {/* <RoomInit /> */}

                {/*<KeyValuePairsInput
                    title="Get The Title From the RoomInit component"
                    items={5} />*/}

                <Rooms />

            </div>
        );
    }
}

export default MainContent;