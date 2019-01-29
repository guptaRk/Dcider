import React from 'react';
import CardContainer from './CardContainer';

class MainContent extends React.Component {
    render() {
        return (
            <div className="d-flex flex-column main-content main-content-without-footer">

                {/* to set the flex-grow of first container to 1 as below is not applied!! */}
                <div className="h-100 d-flex flex-grow-1 flex-column">
                    <CardContainer cards={[{ title: "abcd", date: "1234" }, { title: "abcd", date: "1234" }, { title: "abcd", date: "1234" }, { title: "abcd", date: "1234" }]} />
                    <hr style={{ width: "100%" }} />
                    <CardContainer cards={[{ title: "abcd", date: "1234" }]} />
                </div>

            </div>
        );
    }
}

export default MainContent;