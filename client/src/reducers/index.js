import { combineReducers } from 'redux';
import toggle_menu from './toggle_menu';
import { auth } from './auth';

const reducers = combineReducers({
    toggle_menu: toggle_menu,
    auth: auth
});

export default reducers;