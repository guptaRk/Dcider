import { combineReducers } from 'redux';
import toggle_menu from './toggle_menu';
import cardsToDisplayToggle from './cardToDisplayToggle';
import { auth } from './auth';

const reducers = combineReducers({
    toggle_menu: toggle_menu,
    initialCardsToDisplay: cardsToDisplayToggle,
    auth: auth
});

export default reducers;