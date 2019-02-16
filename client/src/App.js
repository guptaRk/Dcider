import React, { Component } from 'react';
import Header from './components/Header';
import Scrollspy from './components/SideNavigation';
import MainContent from './components/MainContent';
import Footer from './components/Footer';

import { connect } from 'react-redux';
import toggle_menu from './actions/toggle_menu';
import { withRouter } from 'react-router';

import { successfulLogin } from './actions/auth';
import store from './store';

if (localStorage.getItem('x-auth-token')) {
  console.log(localStorage.getItem('x-auth-token'), ", ", store);
  store.dispatch(successfulLogin());
}

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
            "main-content-with-menu-open " :
            "main-content-with-menu-closed "
          ) + ((this.props.auth.isAuthenticated) ? "" : "not-logged-in")}>

        {/*Above classes will not affect Header and Scrollspy components as their position is fixed*/}
        <Header />
        {this.props.auth.isAuthenticated && <Scrollspy />}

        <MainContent />

        {/* yaha div */}
        <Footer />
        {/* yaha end */}
      </div >

    );
  }
}

const mapStateToProps = (state) => {
  return {
    menu_disp: state.toggle_menu,
    auth: state.auth
  };
}

// used withRouter as we have Routes inside some of the component (MainContent) so we have to pass the props (match, history and location)
// If we have rendered the <Route> here then we need not to do this 

/*
  <BrowserRouter>
    <div>
      <Header />
      <Scrollspy />
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route component={NoMatch} />
      </Switch>
    </div>
  </BrowserRouter>
*/

export default withRouter(connect(mapStateToProps, { toggle_menu })(App));
