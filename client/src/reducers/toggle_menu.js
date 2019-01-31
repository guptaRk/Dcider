import { MENU_TOGGLE } from '../actions/types';

const toggle_menu = false;
const body = document.querySelector('body');

export default (prvState = toggle_menu, action) => {

    if (action.type === MENU_TOGGLE) {

        if (window.innerWidth <= 576 && !prvState)
            body.style.width = 250 + window.innerWidth + 'px';
        else body.style.width = '100%';

        return !prvState;
    }
    return prvState;
}