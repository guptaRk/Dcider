import { CARD_TO_DISPLAY } from '../actions/types';

// change this to 1(default value later on)
const state = 2;

export default (prvState = state, action) => {
    if (action.type === CARD_TO_DISPLAY) return action.payload;
    return prvState;
}