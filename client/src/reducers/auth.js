import { AUTH_ERROR, LOGIN_SUCCESS, LOGOUT } from "../actions/types";

const stateStructure = {
  isAuthenticated: false,
  error: {}
};

export const auth = (prvState = stateStructure, action) => {
  if (action.type === AUTH_ERROR) {
    // some error occured due to invalid request during authentication
    return { ...prvState, error: action.payload };
  }
  if (action.type === LOGIN_SUCCESS) {
    return { isAuthenticated: true, error: {} };
  }
  if (action.type === LOGOUT) {
    return { isAuthenticated: false, error: {} };
  }
  return prvState;
}