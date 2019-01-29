import { MENU_TOGGLE } from './types';

const toggle_menu = () => {
    console.log('inside action toggle_menu');
    return {
        type: MENU_TOGGLE
    };
}

export default toggle_menu;