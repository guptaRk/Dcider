import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';

class PrivateRoute extends React.Component {
  render() {
    console.log("privateRoute : ", this.props);
    const { component: Component, ...rest } = this.props;
    return (
      <Route {...rest} render={(props) => {

        console.log(props);
        return (
          this.props.auth.isAuthenticated ?
            <Component {...props} />
            : <Redirect to={{
              pathname: '/login',
              state: { from: props.location }
            }} />);
      }}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth
  };
}

export default connect(mapStateToProps)(PrivateRoute);