import { AUTH_ERROR, LOGIN_SUCCESS, LOGOUT } from "../actions/types";

const stateStructure = {
  isAuthenticated: false,
  email: null,
  uid: null,
  error: {}
};

export const auth = (prvState = stateStructure, action) => {
  if (action.type === AUTH_ERROR) {
    // some error occured due to invalid request during authentication
    return { isAuthenticated: false, error: action.payload, email: null, uid: null };
  }
  if (action.type === LOGIN_SUCCESS) {
    return {
      isAuthenticated: true,
      error: {},
      email: action.payload.email,
      uid: action.payload.uid
    };
  }
  if (action.type === LOGOUT) {
    return { isAuthenticated: false, error: {}, email: null, uid: null };
  }
  return prvState;
}