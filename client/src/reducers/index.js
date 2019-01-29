import { combineReducers } from 'redux';
import toggle_menu from './toggle_menu';

const reducers = combineReducers({
    toggle_menu: toggle_menu
});

export default reducers;