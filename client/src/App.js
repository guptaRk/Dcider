import React, { Component } from 'react';
import Header from './components/Header';
import Scrollspy from './components/SideNavigation';
import MainContent from './components/MainContent';
import Footer from './components/Footer';

import { connect } from 'react-redux';
import toggle_menu from './actions/toggle_menu';

class App extends Component {

  eventListenerAction = (e) => {
    const body = document.querySelector('body');

    if (window.innerWidth < 800 && this.props.menu_disp === true)
      this.props.toggle_menu();
    else if (window.innerWidth >= 800 && this.props.menu_disp === false)
      this.props.toggle_menu();

    if (window.innerWidth <= 576)
      body.style.width = (250 * (this.props.menu_disp ? 1 : 0)) + window.innerWidth + 'px';
    else body.style.width = '100%';

  };

  componentDidMount() {
    if (this.props.menu_disp === false && window.innerWidth >= 800)
      this.props.toggle_menu();

    const body = document.querySelector('body');

    if (window.innerWidth <= 576)
      body.style.width = (250 * (this.props.menu_disp ? 1 : 0)) + window.innerWidth + 'px';
    else body.style.width = '100%';

    window.addEventListener('resize', this.eventListenerAction);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.eventListenerAction);
  }

  render() {
    return (
      <div
        className={"d-flex flex-column h-100 " +
          ((this.props.menu_disp === true) ?
            "main-content-with-menu-open" :
            "main-content-with-menu-closed"
          )}>
        <Header />

        <Scrollspy />
        {/* yaha div */}
        <MainContent />

        <Footer />
        {/* yaha end */}
      </div >


    );
  }
}

const mapStateToProps = (state) => {
  return {
    menu_disp: state.toggle_menu
  };
}

export default connect(mapStateToProps, { toggle_menu })(App);
