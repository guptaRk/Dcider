import { combineReducers } from 'redux';
import toggle_menu from './toggle_menu';
import cardsToDisplayToggle from './cardToDisplayToggle';

const reducers = combineReducers({
    toggle_menu: toggle_menu,
    initialCardsToDisplay: cardsToDisplayToggle
});

export default reducers;