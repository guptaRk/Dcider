import { MENU_TOGGLE } from '../actions/types';

const toggle_menu = false;

export default (prvState = toggle_menu, action) => {
    console.log('Inside Reducer');
    if (action.type === MENU_TOGGLE) {
        return !prvState;
    }
    return prvState;
}