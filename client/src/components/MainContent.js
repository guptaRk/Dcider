import React from 'react';
import CardContainer from './CardContainer';

class MainContent extends React.Component {
    render() {
        return (
            <div className="d-flex flex-column main-content main-content-without-footer">

                {/* to set the flex-grow of first container to 1 as below is not applied!! */}
                <CardContainer flex-grow-1 />
                <hr style={{ width: "100%" }} />
                <CardContainer />

            </div>
        );
    }
}

export default MainContent;