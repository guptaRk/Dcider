import { AUTH_ERROR, LOGIN_SUCCESS, LOGOUT } from './types';
import server from '../Axios';

export const login = (email, password) => {
  return function (dispatch, getState) {
    server.post('/users/login', {
      email: email,
      password: password
    })
      .then(response => {
        // save the session token in the localstorage os client
        localStorage.setItem('x-auth-token', response.headers["x-auth-token"]);

        // set the token in header of every outgoing request
        server.defaults.headers["x-auth-token"] = (response.headers["x-auth-token"]);
        console.log('server : ', server);

        dispatch(successfulLogin(response.data));
      })
      .catch(err => {
        if (err.response) {
          if (err.response.status === 400) dispatch(authError(err.response.data));
          else console.log(err.response);
        }
        else console.log("no response in error(axios)");
      });
  }
};

export const register = (name, email, password) => {
  return function (dispatch, getState) {
    server.post('/users/register', {
      name: name,
      email: email,
      password: password
    })
      .then(response => {
        // save the session token in the localstorage os client
        localStorage.setItem('x-auth-token', response.headers["x-auth-token"]);

        // set the token in header of every outgoing request
        server.defaults.headers['x-auth-token'] = response.headers['x-auth-token'];

        dispatch(successfulLogin(response.data));
      })
      .catch(err => {
        if (err.response) {
          if (err.response.status === 400) dispatch(authError(err.response.data));
          else console.log(err.response);
        }
        else console.log("no response in error(axios)");
      });
  }
}

export const authError = (data) => {
  return {
    type: AUTH_ERROR,
    payload: data
  };
}

export const successfulLogin = (data) => {
  console.log("successful login", data);
  // set the token in header of every outgoing request
  server.defaults.headers["x-auth-token"] = localStorage.getItem('x-auth-token');

  return {
    type: LOGIN_SUCCESS,
    payload: data
  }
}

export const logout = () => {
  //remove the token from the localstorage
  if (localStorage.getItem('x-auth-token')) localStorage.removeItem('x-auth-token');

  //remove the token from the header of the sent requests
  server.defaults.headers['x-auth-token'] = null;

  return {
    type: LOGOUT
  };
}