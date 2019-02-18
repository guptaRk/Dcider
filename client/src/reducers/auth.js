import { AUTH_ERROR, LOGIN_SUCCESS, LOGOUT } from "../actions/types";

const stateStructure = {
  isAuthenticated: false,
  email: null,
  error: {}
};

export const auth = (prvState = stateStructure, action) => {
  console.log("Auth reducer called : ", prvState.email);
  if (action.type === AUTH_ERROR) {
    // some error occured due to invalid request during authentication
    return { isAuthenticated: false, error: action.payload, email: null };
  }
  if (action.type === LOGIN_SUCCESS) {
    return { isAuthenticated: true, error: {}, email: action.payload.email };
  }
  if (action.type === LOGOUT) {
    return { isAuthenticated: false, error: {}, email: null };
  }
  return prvState;
}