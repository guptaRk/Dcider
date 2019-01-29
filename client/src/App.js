import React, { Component } from 'react';
import Header from './components/Header';
import Scrollspy from './components/Scrollspy';
import MainContent from './components/MainContent';
import Footer from './components/Footer';

import { connect } from 'react-redux';
import toggle_menu from './actions/toggle_menu';

class App extends Component {

  componentDidMount() {
    if (this.props.menu_disp === false && window.innerWidth >= 800)
      this.props.toggle_menu();
  }

  render() {
    return (
      <div
        className={
          (
            this.props.menu_disp === true ?
              "main-content-with-menu-open" :
              "main-content-with-menu-closed"
          ) + " d-flex flex-column h-100"
        }>
        <Header />

        <Scrollspy />
        {/* yaha div */}
        <MainContent />

        <Footer />
        {/* yaha end */}
      </div>


    );
  }
}

const mapStateToProps = (state) => {
  return {
    menu_disp: state.toggle_menu
  };
}

export default connect(mapStateToProps, { toggle_menu })(App);
